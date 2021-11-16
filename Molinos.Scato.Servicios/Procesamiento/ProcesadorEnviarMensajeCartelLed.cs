using System;
using System.Linq;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Orquestador;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorEnviarMensajeCartelLed : ProcesadorComando<EnviarMensajeCarteLed>
    {
        private readonly IServicioOrquestador orquestador;

        public ProcesadorEnviarMensajeCartelLed(IRepositorio repositorio, IConversor conversor, IServicioOrquestador orquestador, ILogger log)
            : base(repositorio, conversor, log)
        {
            this.orquestador = orquestador;
        }

        public override Resultado Ejecutar(EnviarMensajeCarteLed comando)
        {
            var resultadoComando = new Resultado();
            Log.Debug($"Mensaje {comando.Mensaje}, Codigo {comando.Codigo} puesto {comando.PuestoDeTrabajoId}");
            if(string.IsNullOrEmpty(comando.Codigo) && comando.PuestoDeTrabajoId != 0)
            {
                comando.Codigo = Repositorio.ObtenerProyeccion<PuestoDeTrabajo, string>(x => x.Id == comando.PuestoDeTrabajoId, x => x.CartelLed);
            }
            if (!string.IsNullOrEmpty(comando.Codigo))
            {
                var resultado = orquestador.Ejecutar(new EjecutarEnviarMensaje { Texto = comando.Mensaje, CodigoDispositivo = comando.Codigo });
                if (resultado.Mensaje != null && resultado.Mensaje.Codigo != 200)
                {
                    Log.Error($"Error al enviar EnviarMensajeCarteLed{comando.Mensaje},{comando.Codigo} al orquestador" + resultado.Mensaje.Descripcion);
                    resultadoComando.Errores.Add("comando.Codigo", resultado.Mensaje.Descripcion);
                }
            }
            
            return resultadoComando;
        }
    }
}
