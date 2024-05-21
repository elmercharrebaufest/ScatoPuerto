using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorEliminarExportadorPuerto : ProcesadorComando<EliminarExportadorPuerto>
    {
        public ProcesadorEliminarExportadorPuerto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(EliminarExportadorPuerto comando)
        {
            var resultado = new Resultado();
            try
            {
                var exportador = Repositorio.Obtener<Exportador>(comando.Id) ?? throw new Exception("No se encontró el exportador en el sistema.");

                if (ExisteEnNominacionActiva(exportador.Id))
                {
                    throw new Exception("No se puede eliminar al exportador ya que esta siendo utilizado en una nominación activa.");
                }

                exportador.Habilitado = false;

                AgregarLogBaja(comando, exportador);

                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al modificar exportador {0}", e);
            }
            return resultado;
        }

        private void AgregarLogBaja(EliminarExportadorPuerto comando, Exportador exportadorDto)
        {
            var logABM = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                ClaseId = comando.Id
            };
            var exportadorJson = Conversor.Convertir<Exportador, ExportadorDto>(exportadorDto).ToJson();
            logABM.Entidad = "Desactiva -> " + exportadorJson;

            Repositorio.Agregar(logABM);
        }

        private bool ExisteEnNominacionActiva(int id)
        {
            return Repositorio.Incluir<Nominacion>()
                .Where(n => n.FechaEliminacion == null && (n.Embarque == null || n.Embarque.Ubicacion != 1))
                .SelectMany(n => n.NominacionDatoTecnico.NominacionDatoTecnicoExportador)
                .Any(e => e.Exportador.Id == id);
        }
    }
}