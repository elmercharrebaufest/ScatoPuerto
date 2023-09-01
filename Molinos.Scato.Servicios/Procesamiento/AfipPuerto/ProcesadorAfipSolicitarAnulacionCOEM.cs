using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
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

namespace Molinos.Scato.Servicios.Procesamiento.AfipPuerto
{
    public class ProcesadorAfipSolicitarAnulacionCOEM : ProcesadorComando<AfipSolicitarAnulacionCoem>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;

        public ProcesadorAfipSolicitarAnulacionCOEM(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipSolicitarAnulacionCoem comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var coemDB = Repositorio.Obtener<AfipCoem>(comando.Id);
                if (coemDB == null)
                {
                    throw new Exception("No existe la COEM con el id expecificado");
                }

                if (coemDB.AfipCoemEstado.Estado == EstadosCoemAFIP.Registrada || coemDB.AfipCoemEstado.Estado == EstadosCoemAFIP.Presentada)
                {
                    var res = comunicacionEmbarqueServicioHelper.SolicitarAnulacionCOEM(coemDB.IdentificadorCaratula, coemDB.IdentificadorCOEM);
                    var cuerpoRespuesta = res.Body.SolicitarAnulacionCOEMResult.ListaErrores[0];
                    if(cuerpoRespuesta != null && cuerpoRespuesta.Codigo != 0)
                    {
                        throw new Exception(String.Format("Ocurrió un error al SOLICITAT_ANULACION de la coem: {0} {1}", cuerpoRespuesta.Descripcion, cuerpoRespuesta.DescripcionAdicional));
                    }
                    Repositorio.GuardarCambios();                    
                }                
            }
            catch (Exception e)
            {
                resultado.Error("", Textos.Error_ActualizarGenerico);
                Log.Error("Error al Solicitar Anulacion de COEM {0}", e.StackTrace);                
            }
            return resultado;
        }
    }
}
