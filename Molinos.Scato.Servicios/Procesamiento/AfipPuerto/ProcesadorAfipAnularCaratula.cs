using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using System;
using System.Linq;
using System.Text;

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
                var caratulaDb = Repositorio.Obtener<AfipCaratula>(comando.Id) ?? throw new Exception("No existe la carátula con el id especificado");

                // TODO: Revisar que todas sus COEM se encuentren anuladas, caso contrario impedir anulación

                var res = comunicacionEmbarqueServicioHelper.AnularCaratula(caratulaDb.IdentificadorCaratula).Body.AnularCaratulaResult;
                var cuerpoRespuesta = res.ListaErrores.FirstOrDefault(x => x.Codigo == 0); // La ejecución exitosa tiene como codigo de error 0
                if (cuerpoRespuesta == null)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                    res.ListaErrores.ForEach(e => sb.AppendLine(String.Format("{0} {1}", e.Descripcion, e.DescripcionAdicional)));
                    throw new Exception(sb.ToString());
                }
                caratulaDb.Estado = EstadosCaratulaAFIP.Eliminado;

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Baja,
                    Entidad = JsonConverter<AfipCaratula>.Serialize(caratulaDb),
                    ClaseId = comando.Id
                };
                Repositorio.Agregar(logABM);

                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al anular caratula {0}", e);
            }
            return resultado;
        }
    }
}
