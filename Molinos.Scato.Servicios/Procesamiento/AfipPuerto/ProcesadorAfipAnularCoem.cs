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
    public class ProcesadorAfipAnularCoem : ProcesadorComando<AfipAnularCoem>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;

        public ProcesadorAfipAnularCoem(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipAnularCoem comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var coemDB = Repositorio.Obtener<AfipCoem>(comando.Id);
                if (coemDB == null)
                {
                    throw new Exception("No existe la COEM con el id especificado");
                }

                //Se anula la COEM, siempre que esta se encuentre en el estado en CURSO/REGISTRADA, identificada por un identificador de Caratula
                if (coemDB.AfipCoemEstado.Estado == EstadosCoemAFIP.Registrada)
                {
                    var res = comunicacionEmbarqueServicioHelper.AnularCOEM(coemDB.IdentificadorCaratula, coemDB.IdentificadorCOEM);
                    var cuerpoRespuesta = res.Body.AnularCOEMResult.ListaErrores[0];
                    if (cuerpoRespuesta != null && cuerpoRespuesta.Codigo != 0)
                    {
                        throw new Exception(String.Format("Ocurrió un error al ANULAR la coem: {0} {1}", cuerpoRespuesta.Descripcion, cuerpoRespuesta.DescripcionAdicional));
                    }
                    coemDB.AfipCoemEstado.Estado = EstadosCoemAFIP.Anulada;
                    Repositorio.GuardarCambios();
                }
                
            }
            catch (Exception e)
            {
                resultado.Error("", Textos.Error_ActualizarGenerico);
                Log.Error("Error al anular COEM {0}", e.StackTrace);               
            }
            return resultado;
        }
    }
}
