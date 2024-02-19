using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;
using System;
using System.Linq;
using System.Text;

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
                var caratula = comando.Dto ?? throw new Exception("La caratula recibida es nula");
                var res = this.comunicacionEmbarqueServicioHelper.RegistrarCaratula(caratula).Body.RegistrarCaratulaResult;
                var cuerpoRespuesta = res.ListaErrores.FirstOrDefault(x => x.Codigo == 0); // La ejecución exitosa tiene como codigo de error 0
                if (cuerpoRespuesta == null)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                    res.ListaErrores.ForEach(e=> sb.AppendLine(String.Format("{0} {1}", e.Descripcion, e.DescripcionAdicional)));
                    throw new Exception(sb.ToString());
                }
                string caratulaId = cuerpoRespuesta.DescripcionAdicional.Split(' ')[1];

                var caratulaDb = this.Conversor.Convertir<AfipCaratulaDto, AfipCaratula>(caratula);
                caratulaDb.IdentificadorCaratula = caratulaId;
                caratulaDb.FechaRegistro = DateTime.Now;
                caratulaDb.Estado = EstadosCaratulaAFIP.Aceptado;
                Repositorio.Agregar(caratulaDb);
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al registrar caratula {0}", e);
            }
            return resultado;
        }
    }
}
