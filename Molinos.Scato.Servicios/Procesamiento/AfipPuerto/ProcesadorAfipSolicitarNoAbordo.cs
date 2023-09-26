using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento.AfipPuerto
{
    public class ProcesadorAfipSolicitarNoAbordo : ProcesadorComando<AfipSolicitarNoAbordo>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;

        public ProcesadorAfipSolicitarNoAbordo(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipSolicitarNoAbordo comando)
        {
            var resultado = new ResultadoCrear();

            try
            {
                var caratulaDB = Repositorio.Obtener<AfipCaratula>(comando.Dto.IdCaratula);
                var coemDB = Repositorio.Obtener<AfipCoem>(comando.Dto.IdCoem);

                if (caratulaDB == null)
                {
                    throw new Exception("No existe la Caratula con el id especificado");
                }

                //var contenedoresVacios = Repositorio.Listar<AfipCoemContenedorVacio>(x => x.AfipCoem.Id == coemDB.Id);
                //var contenedoresCarga = Repositorio.Listar<AfipCoemContenedorConCarga>(x => x.AfipCoem.Id == coemDB.Id);                
                
                var contenedoresDeclaracionesMercaderiaSuelta = Repositorio.Listar<AfipCoemMercaderiaSuelta>(x => x.AfipCoem.Id == coemDB.Id);
                var declaraciones = this.Conversor.Convertir<IList<AfipCoemMercaderiaSuelta>, IList<Declaracion>>(contenedoresDeclaracionesMercaderiaSuelta).ToArray();


                var res = comunicacionEmbarqueServicioHelper.SolicitarNoAbordo(caratulaDB.IdentificadorCaratula, coemDB.IdentificadorCOEM, declaraciones);
                var cuerpoRespuesta = res.Body.SolicitarNoABordoResult.ListaErrores[0];

                if (cuerpoRespuesta.Codigo != 0)
                {
                    throw new Exception(String.Format("Ocurrió un error al Solicitar No Abordo: {0} {1}", cuerpoRespuesta.Descripcion, cuerpoRespuesta.DescripcionAdicional));
                }

                var identificadorSolicitud = cuerpoRespuesta.DescripcionAdicional.Split(' ')[1];
            }
            catch (Exception ex)
            {
                resultado.Error("", ex.Message);
                Log.Error("Error al solicitar no abordo {0}", ex.Message);                
            }
            return resultado;
        }
    }
}
