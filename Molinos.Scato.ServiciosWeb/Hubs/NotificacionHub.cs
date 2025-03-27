using Microsoft.AspNet.SignalR;

namespace Molinos.Scato.ServiciosWeb.Hubs
{
    public class NotificacionHub : Hub
    {
        public void NotificarAGrupo(NotificacionOperacionDto notificacion)
        {
            Clients.OthersInGroup(notificacion.IdModuloCarga + "|" + notificacion.Modulo).notificarAGrupo(notificacion);
        }

        public void SuscribirAGrupo(string codigoGrupo)
        {
            Groups.Add(Context.ConnectionId, codigoGrupo);
        }

        public void DesuscribirDeGrupo(string codigoGrupo)
        {
            Groups.Remove(Context.ConnectionId, codigoGrupo);
        }
    }
}