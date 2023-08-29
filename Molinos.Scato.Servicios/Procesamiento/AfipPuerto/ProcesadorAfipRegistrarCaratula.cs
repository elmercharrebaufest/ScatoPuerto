using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorAfipRegistrarCaratula : ProcesadorComando<AfipRegistrarCaratula>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;
        public ProcesadorAfipRegistrarCaratula(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipRegistrarCaratula comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var caratula = comando.Dto;
                if (caratula == null) { throw new Exception("La caratula recibida es nula"); }

                var res = this.comunicacionEmbarqueServicioHelper.RegistrarCaratula(caratula);
                var cuerpoRespuesta = res.Body.RegistrarCaratulaResult.ListaErrores[0];
                //TODO Si la ejecución es exitosa, el código de error devuelto es 0 (cero), la descripción “Ejecución Exitosa” y se devolverá el IdentificadorCaratula en el tag <DescripcionAdicional>
                if (cuerpoRespuesta.Codigo != 0)
                {
                    throw new Exception(String.Format("Ocurrió un error al registrar la caratula: {0} {1}", cuerpoRespuesta.Descripcion, cuerpoRespuesta.DescripcionAdicional));
                }
                string caratulaId = cuerpoRespuesta.DescripcionAdicional;

                var caratulaDb = this.Conversor.Convertir<AfipCaratulaDto, AfipCaratula>(caratula);
                caratulaDb.IdentificadorCaratula = Guid.NewGuid().ToString().Substring(0, 16); // TODO: utilizar caratulaId
                caratulaDb.FechaRegistro = DateTime.Now;
                caratulaDb.Estado = EstadosCaratulaAFIP.Aceptado;
                Repositorio.Agregar(caratulaDb);
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", Textos.Error_ActualizarGenerico);
                Log.Error("Error al registrar caratula {0}", e.StackTrace);
            }
            return resultado;
        }
    }
}
