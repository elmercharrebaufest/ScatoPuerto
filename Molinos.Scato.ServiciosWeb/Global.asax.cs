using System.Net;
using System.Web;
using log4net;
using Molinos.Scato.ServiciosWeb.App_Start;

namespace Molinos.Scato.ServiciosWeb
{
    public class Global : HttpApplication
    {
        protected void Application_Start()
        {
            ServicePointManager.SecurityProtocol |=
                SecurityProtocolType.Tls11 |
                SecurityProtocolType.Tls12 |
                SecurityProtocolType.Tls13;
    
            Log4NetConfig.Configure(Server);
        }

        protected void Application_Error()
        {
            var ex = Server.GetLastError();
            var logger = LogManager.GetLogger(GetType());
            logger.Error("Excepción no manejada: ", ex);
        }
    }
}