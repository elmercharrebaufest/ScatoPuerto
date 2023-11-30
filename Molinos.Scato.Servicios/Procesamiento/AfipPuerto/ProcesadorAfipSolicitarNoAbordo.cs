using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Dto;
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
                var caratulaDB = Repositorio.Obtener<AfipCaratula>(comando.Dto.IdCaratula) ?? throw new Exception("No existe la Caratula con el id especificado");
                var coemDB = Repositorio.Obtener<AfipCoem>(comando.Dto.IdCoem);

                var contenedoresDeclaracionesMercaderiaSuelta = Repositorio.Listar<AfipCoemMercaderiaSuelta>(x => x.AfipCoem.Id == coemDB.Id);
                var declaraciones = this.Conversor.Convertir<IList<AfipCoemMercaderiaSuelta>, IList<Declaracion>>(contenedoresDeclaracionesMercaderiaSuelta).ToArray();
                var motivo = Repositorio.Listar<AfipMotivoNoABordo>(x => x.Codigo == comando.Dto.CodigoMotivo).FirstOrDefault();

                var res = comunicacionEmbarqueServicioHelper.SolicitarNoAbordo(caratulaDB.IdentificadorCaratula, coemDB.IdentificadorCOEM, declaraciones, motivo).Body.SolicitarNoABordoResult;
                var cuerpoRespuesta = res.ListaErrores.FirstOrDefault(x => x.Codigo == 0); // La ejecución exitosa tiene como codigo de error 0
                if (cuerpoRespuesta == null)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                    res.ListaErrores.ForEach(e => sb.AppendLine(String.Format("{0} {1}", e.Descripcion, e.DescripcionAdicional)));
                    throw new Exception(sb.ToString());
                }

                var identificadorSolicitud = cuerpoRespuesta.DescripcionAdicional.Split(' ')[1];
            }
            catch (Exception ex)
            {
                resultado.Error("", ex.Message);
                Log.Error("Error al solicitar no abordo {0}", ex);                
            }
            return resultado;
        }
    }
}
