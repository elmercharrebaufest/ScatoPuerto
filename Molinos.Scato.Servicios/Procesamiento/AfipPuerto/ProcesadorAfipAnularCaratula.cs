using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorAfipAnularCaratula : ProcesadorComando<AfipAnularCaratula>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;
        public ProcesadorAfipAnularCaratula(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipAnularCaratula comando)
        {
            var resultado = new Resultado();
            try
            {
                var caratulaDb = Repositorio.Obtener<AfipCaratula>(comando.Id);
                if (caratulaDb == null)
                {
                    throw new Exception("No existe la carátula con el id especificado");
                }
                
                // TODO: Revisar que todas sus COEM se encuentren anuladas, caso contrario impedir anulación
                
                var res = comunicacionEmbarqueServicioHelper.AnularCaratula(caratulaDb.IdentificadorCaratula);
                var cuerpoRespuesta = res.Body.AnularCaratulaResult.ListaErrores[0];
                if (cuerpoRespuesta != null && cuerpoRespuesta.Codigo != 0)
                {
                    throw new Exception(String.Format("Ocurrió un error al anular la caratula: {0} {1}", cuerpoRespuesta.Descripcion, cuerpoRespuesta.DescripcionAdicional));
                }
                caratulaDb.Estado = EstadosCaratulaAFIP.Eliminado;
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", Textos.Error_ActualizarGenerico);
                Log.Error("Error al anular caratula {0}", e.StackTrace);
            }
            return resultado;
        }
    }
}
