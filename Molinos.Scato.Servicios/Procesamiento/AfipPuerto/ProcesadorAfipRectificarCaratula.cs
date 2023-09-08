using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;
using Ninject.Infrastructure.Language;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorAfipRectificarCaratula : ProcesadorComando<AfipRectificarCaratula>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;
        public ProcesadorAfipRectificarCaratula(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipRectificarCaratula comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var caratula = comando.Dto;
                if (caratula == null || caratula.Id == 0)
                {
                    throw new Exception("La caratula recibida es nula");
                }

                var caratulaDb = Repositorio.Obtener<AfipCaratula>(caratula.Id);

                if (caratulaDb == null)
                {
                    throw new Exception("No existe la carátula con el id especificado");
                }

                // Campos que no vienen en el dto pero que igual no deben variar
                caratula.IdentificadorCaratula = caratulaDb.IdentificadorCaratula;
                caratula.FechaRegistro = caratulaDb.FechaRegistro;

                //TODO: Implementar comunicación con AFIP
                //var response = this.comunicacionEmbarqueServicioHelper.RectificarCaratula(caratula);
                //var cuerpoRespuesta = response.Body.RectificarCaratulaResult.ListaErrores[0]; // Si la ejecución es exitosa, el código de error devuelto es 0 (cero), la descripción “Ejecución Exitosa”.
                //if (cuerpoRespuesta != null && cuerpoRespuesta.Codigo != 0)
                //{
                //    throw new Exception(String.Format("Ocurrió un error al registrar la caratula: {0} {1}", cuerpoRespuesta.Descripcion, cuerpoRespuesta.DescripcionAdicional));
                //}

                var itinerariosDb = Repositorio.Listar<AfipCaratulaItinerario>(x => x.AfipCaratula.Id == caratula.Id);
                foreach (var itinerario in itinerariosDb) Repositorio.Remover(itinerario);

                Conversor.Convertir(caratula, caratulaDb);
                caratulaDb.Estado = EstadosCaratulaAFIP.Rectificado;

                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", Textos.Error_ActualizarGenerico);
                Log.Error("Error al rectificar caratula {0}", e.StackTrace);
            }
            return resultado;
        }
    }
}
