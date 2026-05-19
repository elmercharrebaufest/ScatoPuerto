using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;
using System;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorEliminarAgenciaMaritimaATA : ProcesadorComando<EliminarAgenciaMaritimaATA>
    {
        public ProcesadorEliminarAgenciaMaritimaATA(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        /// <summary>
        /// Verifica que el cuit ingresado no se encuentre en una Coem cuyo estado no es final
        /// </summary>
        /// <param name="cuit"></param>
        /// <returns></returns>
        private bool ValidarEnCoemActiva(string cuit)
        {
            var codigos = new string[] { "REC", "ANU", "CODE" };
            return !Repositorio.Existe<AfipCoem>(c => c.MercaderiasSueltas.Any(m => m.CuitATA == cuit && !codigos.Contains(m.CuitATA)));
        }

        /// <summary>
        /// Valida que la agencia maritima o ATA no se encuentre actualmente en uso en una nominacion activa o en lineup.
        /// En caso de existir, lanza una excepción.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="tipo"></param>
        /// <exception cref="Exception">Excepción con el mensaje de dónde está en uso</exception>
        private void ValidarEnNominacionLineUp(int id, AgenciaMaritimaATATipo tipo)
        {
            var tipoStr = tipo == AgenciaMaritimaATATipo.AgenciaMaritima ? "la agencia maritima" : "el ATA";
            var nominaciones = Repositorio.Incluir<Nominacion>();
            var nominacionActiva = (
                from n in nominaciones
                where !n.FechaEliminacion.HasValue && !n.FechaEnvioLineUp.HasValue && // Si fue eliminada ya no cuenta, si fue enviada a lineup reviso por embarque
                    ((tipo == AgenciaMaritimaATATipo.AgenciaMaritima && n.NominacionDatoTecnico.AgenciaMaritimaPuerto.Id == id) ||
                    (tipo == AgenciaMaritimaATATipo.ATA && n.NominacionDatoTecnico.ATAPuerto.Id == id))
                select n).Any();

            if (nominacionActiva)
            {
                throw new Exception($"No se puede eliminar {tipoStr} porque se encuentra actualmente en uso en una nominación");
            }

            var lineups = Repositorio.Incluir<LineUp>();
            var embarques = Repositorio.Incluir<Embarque>();
            var estaEnLineup = (
                from e in embarques
                join l in lineups on e.Id equals l.Embarque.Id
                where e.Ubicacion != 1 && l.ModuloDeCarga != null && l.ModuloDeCarga.Id > 0 &&
                    ((tipo == AgenciaMaritimaATATipo.AgenciaMaritima && e.Agencias.Id == id) ||
                    (tipo == AgenciaMaritimaATATipo.ATA && e.ATA.Id == id))
                select e).Any();
            if (estaEnLineup)
            {
                throw new Exception($"No se puede eliminar {tipoStr} porque se encuentra actualmente en uso en lineup");
            }
        }

        public override Resultado Ejecutar(EliminarAgenciaMaritimaATA comando)
        {
            var resultado = new Resultado();
            try
            {
                var tipo = (AgenciaMaritimaATATipo)comando.Tipo;
                ValidarEnNominacionLineUp(comando.Id, tipo);

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Baja,
                    ClaseId = comando.Id
                };

                if (tipo == AgenciaMaritimaATATipo.AgenciaMaritima)
                {
                    var agenciaDb = Repositorio.Obtener<AgenciaMaritimaPuerto>(comando.Id) ?? throw new Exception("No se encontró una agencia maritima con el id especificado");

                    if (!ValidarEnCoemActiva(agenciaDb.Cuit))
                    {
                        throw new Exception("No se puede eliminar la agencia ya que esta siendo utilizada en una COEM activa");
                    }

                    agenciaDb.Activa = false;

                    // También desactivar el ATA vinculado si existe
                    if (agenciaDb.AtaPuerto != null)
                    {
                        agenciaDb.AtaPuerto.Activa = false;
                    }

                    var agenciaJson = Conversor.Convertir<AgenciaMaritimaPuerto, AgenciaMaritimaPuertoDto>(agenciaDb).ToJson();
                    logABM.Entidad = agenciaJson;
                }
                else if (tipo == AgenciaMaritimaATATipo.ATA)
                {
                    var ataDb = Repositorio.Obtener<ATAPuerto>(comando.Id) ?? throw new Exception("No se encontró un ATA con el id especificado");

                    if (!ValidarEnCoemActiva(ataDb.Cuit))
                    {
                        throw new Exception("No se puede modificar el ATA ya que esta siendo utilizada en una COEM activa");
                    }

                    ataDb.Activa = false;
                    var ataJson = Conversor.Convertir<ATAPuerto, ATAPuertoDto>(ataDb).ToJson();
                    logABM.Entidad = ataJson;
                }
                else
                {
                    throw new Exception("El tipo especificado no existe");
                }

                Repositorio.Agregar(logABM);
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al eliminar Agencia Maritima o ATA {0}", e);
            }
            return resultado;
        }
    }
}
