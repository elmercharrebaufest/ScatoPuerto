using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento.AfipPuerto
{
    public class ProcesadorAfipRectificarCoem : ProcesadorComando<AfipRectificarCoem>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;
        public ProcesadorAfipRectificarCoem(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }
        public override Resultado Ejecutar(AfipRectificarCoem comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var coem = comando.Dto;
                               
                var mercaderiasSueltasDB = Repositorio.Listar<AfipCoemMercaderiaSuelta>(x => x.AfipCoem.Id == coem.Id);                

                var coemDb = Repositorio.Obtener<AfipCoem>(coem.Id);
                if (coemDb == null)
                {
                    throw new Exception("No existe la COEM con el id especificado");
                }

                var response = this.comunicacionEmbarqueServicioHelper.RectificarCOEM(coem);
                var cuerpoRespuesta = response.Body.RectificarCOEMResult.ListaErrores[0];
                if (cuerpoRespuesta != null && cuerpoRespuesta.Codigo != 0)
                {
                    throw new Exception(String.Format("Ocurrió un error al rectificar la COEM: {0} {1}", cuerpoRespuesta.Descripcion, cuerpoRespuesta.DescripcionAdicional));
                }

                var mercaderiasSueltas = this.Conversor.ConvertirList<AfipCoemMercaderiaSueltaDto, AfipCoemMercaderiaSuelta>(coem.MercaderiasSueltas);
                mercaderiasSueltasDB = mercaderiasSueltas;

                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                resultado.Error("", ex.Message);
                Log.Error("Error al rectificar Coem {0}", ex.Message);                
            }
            return resultado;
        }
    }
}
