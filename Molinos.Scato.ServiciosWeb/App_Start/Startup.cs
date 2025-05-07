using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(Molinos.Scato.ServiciosWeb.App_Start.Startup))]

namespace Molinos.Scato.ServiciosWeb.App_Start
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}