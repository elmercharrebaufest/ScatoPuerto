using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorActualizarNominacionDocumentoEstado : ProcesadorComando<ActualizarNominacionDocumentoEstado>
    {
        public ProcesadorActualizarNominacionDocumentoEstado(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(ActualizarNominacionDocumentoEstado comando)
        {
            var resultado = new Resultado();
            try
            {
                var nominacionDocumento = Repositorio.Obtener<NominacionDocumento>(comando.NomDocId) ?? throw new Exception("No se ha encontrado la nominacion con el id especificado");
                var estado = Repositorio.Obtener<NominacionDocumentoEstado>(comando.EstadoId) ?? throw new Exception("No se ha encontrado el estado con el id especificado");

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = nominacionDocumento.NominacionDocumentoEstado.Estado + " -> " + estado.Estado,
                    ClaseId = comando.NomDocId
                };
                Repositorio.Agregar(logABM);

                nominacionDocumento.NominacionDocumentoEstado = estado;
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al actualizar estado de documento {0}", e);
            }
            return resultado;
        }
    }
}
