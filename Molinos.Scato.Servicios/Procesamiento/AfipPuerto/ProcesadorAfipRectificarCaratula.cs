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

                var caratulaDb = Repositorio.Obtener<AfipCaratula>(caratula.Id) ?? throw new Exception("No existe la carátula con el id especificado");

                // Campos que no vienen en el dto pero que igual no deben variar
                caratula.IdentificadorCaratula = caratulaDb.IdentificadorCaratula;
                caratula.FechaRegistro = caratulaDb.FechaRegistro;

                var res = this.comunicacionEmbarqueServicioHelper.RectificarCaratula(caratula).Body.RectificarCaratulaResult;
                var cuerpoRespuesta = res.ListaErrores.FirstOrDefault(x => x.Codigo == 0); // La ejecución exitosa tiene como codigo de error 0
                if (cuerpoRespuesta == null)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                    res.ListaErrores.ForEach(e => sb.AppendLine(String.Format("{0} {1}", e.Descripcion, e.DescripcionAdicional)));
                    throw new Exception(sb.ToString());
                }

                var itinerariosDb = Repositorio.Listar<AfipCaratulaItinerario>(x => x.AfipCaratula.Id == caratula.Id);
                foreach (var itinerario in itinerariosDb) Repositorio.Remover(itinerario);

                Conversor.Convertir(caratula, caratulaDb);
                caratulaDb.Estado = EstadosCaratulaAFIP.Rectificado;

                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al rectificar caratula {0}", e);
            }
            return resultado;
        }
    }
}
