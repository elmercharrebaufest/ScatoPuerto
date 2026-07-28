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
    public class ProcesadorEliminarDestinoPuerto : ProcesadorComando<EliminarDestinoPuerto>
    {
        public ProcesadorEliminarDestinoPuerto(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log)
        {
        }

        /// <summary>
        /// Verifica si el destino a eliminar se encuentra en una Nominacion activa.
        /// Una nominación activa es una cuyo embarque aún no zarpó, o una no enviada a LineUp que no haya sido eliminada.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        private bool ExisteEnNominacionActiva(int id)
        {
            return Repositorio.Incluir<Nominacion>()
                .Where(n => n.FechaEliminacion == null && (n.Embarque == null || n.Embarque.Ubicacion != 1))
                .SelectMany(n => n.NominacionDatoTecnico.NominacionDatoTecnicoDestino)
                .Any(d => d.Destino.Id == id);
        }

        public override Resultado Ejecutar(EliminarDestinoPuerto comando)
        {
            var resultado = new Resultado();
            try
            {
                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    ClaseId = comando.Id
                };

                if (ExisteEnNominacionActiva(comando.Id))
                {
                    throw new Exception("No se puede anular al destino ya que esta siendo utilizado en una Nominación");
                }

				var destinoDb = Repositorio.Incluir<Destino>(d => d.Bandera)
						   .FirstOrDefault(d => d.Id == comando.Id)
				            ?? throw new Exception("No se encontró un destino con el id especificado");
				destinoDb.Activo = false;

                var destinoJson = Conversor.Convertir<Destino, DestinoDto>(destinoDb).ToJson();
                logABM.Entidad = destinoJson;

                EliminarDocumentos(comando.Id);

                Repositorio.Agregar(logABM);
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al modificar destino {0}", e);
            }
            return resultado;
        }

        private void EliminarDocumentos(int destinoId)
        {
            var documentos = this.Repositorio.Listar<DocumentoDestino>(d => d.Destino.Id == destinoId);
            foreach (DocumentoDestino doc in documentos)
            {
                this.Repositorio.Remover(doc);
            }
        }
    }
}