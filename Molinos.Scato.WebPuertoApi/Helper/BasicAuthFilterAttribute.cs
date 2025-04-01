using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Configuration;  

public class BasicAuthFilterAttribute : AuthorizationFilterAttribute
{
    public override async Task OnAuthorizationAsync(HttpActionContext actionContext, CancellationToken cancellationToken)
    {
        // Verificar si hay encabezado de autorización
        var authHeader = actionContext.Request.Headers.Authorization;

        if (authHeader == null || authHeader.Scheme != "Basic")
        {
            // Si no hay encabezado de autorización o el esquema no es 'Basic', respondemos con 401
            actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, "Authorization header is missing or invalid.");
            return;
        }

        // Extraer las credenciales codificadas en base64
        var authValue = authHeader.Parameter;
        var credentials = Encoding.UTF8.GetString(Convert.FromBase64String(authValue)).Split(':');

        if (credentials.Length != 2)
        {
            // Si el formato de las credenciales no es correcto
            actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, "Invalid authorization format.");
            return;
        }

        var username = credentials[0];
        var password = credentials[1];

        // Validar las credenciales
        if (!IsValidUser(username, password))
        {
            // Si las credenciales no son válidas
            actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, "Invalid credentials.");
            return;
        }

        // Si la autorización fue exitosa, continuar con la acción
        await Task.FromResult(0); // Esto marca que la autorización fue exitosa
    }

    private bool IsValidUser(string username, string password)
    {
        // Obtener las credenciales desde la configuración
        string configUsername = ConfigurationManager.AppSettings["WebPuertoApiUsername"];
        string configPassword = ConfigurationManager.AppSettings["WebPuertoApiPassword"];

        // Comparar las credenciales de la solicitud con las de configuración
        return username == configUsername && password == configPassword;
    }
}
