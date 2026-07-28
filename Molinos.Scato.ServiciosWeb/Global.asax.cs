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

            // Configurar validación de certificados SSL para servicios internos (SAP)
            ServicePointManager.ServerCertificateValidationCallback += 
                (sender, certificate, chain, sslPolicyErrors) =>
                {
                    // Aceptar certificados de servidores internos de SAP
                    if (sslPolicyErrors == System.Net.Security.SslPolicyErrors.None)
                        return true;

                    // Verificar si es el servidor SAP interno
                    if (certificate != null && 
                        (certificate.Subject.Contains("sap.molinosagro.ad") || 
                         certificate.Issuer.Contains("molinosagro")))
                    {
                        return true;
                    }

                    // Para cualquier otro caso, rechazar
                    return false;
                };

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