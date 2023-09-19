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
    public class ProcesadorAfipCerrarCoem : ProcesadorComando<AfipCerrarCoem>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;

        public ProcesadorAfipCerrarCoem(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipCerrarCoem comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var coemDB = Repositorio.Obtener<AfipCoem>(comando.Id);
                var estado = Repositorio.Obtener<AfipCoemEstado>(comando.IdEstado);
                if (coemDB == null)
                {
                    throw new Exception("No existe la COEM con el id especificado");
                }

                var res = comunicacionEmbarqueServicioHelper.CerrarCOEM(coemDB.IdentificadorCaratula, coemDB.IdentificadorCOEM);
                var cuerpoRespuesta = res.Body.CerrarCOEMResult.ListaErrores[0];
                if (cuerpoRespuesta != null && cuerpoRespuesta.Codigo != 0)
                {
                    throw new Exception(String.Format("Ocurrió un error al CERRAR la coem: {0} {1}", cuerpoRespuesta.Descripcion, cuerpoRespuesta.DescripcionAdicional));
                }
                coemDB.AfipCoemEstado = estado;
                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                resultado.Error("", ex.Message);
                Log.Error("Error al cerrar COEM {0}", ex.Message);                
            }
            return resultado;
        }
    }
}
