using System;
using System.Configuration;
using Microsoft.AspNet.SignalR.Client;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Servicios;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Web.ServicioHub
{
    public class ServicioNotificarUsuario : IServicioNotificarUsuario
    {
        private readonly ILogger log;
        private readonly IServicioComandos servicioComandos;
        private readonly HubClientNotificar hubClientNotificar;

        public ServicioNotificarUsuario(ILogger log, IServicioComandos servicioComandos, HubClientFactory hubClientFactory)
        {
            this.log = log;
            this.servicioComandos = servicioComandos;
            this.hubClientNotificar = hubClientFactory.GetClientNotificar("notificarUsuario");
        }

        public void Notificar(NotificacionDto notificacion)
        {
            try
            {
                log.Debug("Iniciando- NotificarMensaje usuario: {0}, mensaje: {1}", notificacion.Grupo, notificacion.Mensaje);
                notificacion.Hora = DateTime.Now;
                var resultado = servicioComandos.Ejecutar(new CrearNotificacion { Dto = notificacion }) as ResultadoCrear;
                if (resultado != null)
                {
                    notificacion.Id = resultado.Id;
                }

                hubClientNotificar.Invoke("Notificar", notificacion);

                log.Debug("Fin- Mensaje enviado a usuario: {0} exitosamente", notificacion.Grupo);
            }
            catch (Exception e)
            {
                log.Error(e, "Error al enviar notificación: {0}", notificacion.Mensaje);
            }
        }
    }
}
