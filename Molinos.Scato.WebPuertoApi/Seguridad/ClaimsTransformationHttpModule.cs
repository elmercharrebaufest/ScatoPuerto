using Microsoft.Identity.Client;
using System;
using System.IdentityModel.Services;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace Molinos.Scato.WebPuertoApi.Seguridad
{
    public class ClaimsTransformationHttpModule : IHttpModule
    {
        public void Dispose()
        { }

        public void Init(HttpApplication context)
        {
            context.PostAuthenticateRequest += Context_PostAuthenticateRequest;
        }

         void Context_PostAuthenticateRequest(object sender, EventArgs e)
        {
            var context = ((HttpApplication)sender).Context;

            // no need to call transformation if session already exists
            if (FederatedAuthentication.SessionAuthenticationModule != null && FederatedAuthentication.SessionAuthenticationModule.ContainsSessionTokenCookie(context.Request.Cookies))
            {
                return;
            }

            var transformer =
            FederatedAuthentication.FederationConfiguration.IdentityConfiguration.ClaimsAuthenticationManager;
            if (transformer != null)
            {
                var transformedPrincipal = transformer.Authenticate(context.Request.RawUrl, context.User as ClaimsPrincipal);

                context.User = transformedPrincipal;
                Thread.CurrentPrincipal = transformedPrincipal;
            }
        }

        private async Task loginAzure()
        {
            //  string TenantId = "64912498-cd87-469f-a9e5-44e257a06b60";
            //  string ClientId = "f18c7be4-4ada-4852-a4db-9ffc444c68fa";
            //var clientId = "f18c7be4-4ada-4852-a4db-9ffc444c68fa";
            string clientId = "560b50b4-0d0d-42b9-b6ed-792cba10142c";
            var tenantId = "64912498-cd87-469f-a9e5-44e257a06b60";
            var redirectUri = "https://localhost/webpuertoapi";

            string clientIdMOC = "5ab4c0b8-bf3b-42ef-90b9-697559762d72";
            var tenantIdMOC = "c5d83817-b680-4929-9c3c-407e37ea2678";
            var redirectUriMOC = "https://localhost/webpuertoapi";

            var scopes = new[] { "user.read" };

            var app = PublicClientApplicationBuilder
                .Create(clientIdMOC)
                .WithAuthority($"https://login.microsoftonline.com/{tenantIdMOC}")
                .WithRedirectUri(redirectUriMOC)
                .Build();

            var result = await app.AcquireTokenInteractive(scopes).ExecuteAsync();
            Console.WriteLine(result.AccessToken);
        }

        private async Task lofAsync()
        {
            if (HttpContext.Current.User != null && HttpContext.Current.User.Identity.IsAuthenticated)
            { // La solicitud ya ha sido autenticada 
              // Puede acceder a la identidad del usuario autenticado usando HttpContext.Current.User.Identity
                return;
            }

            string clientIdMOC = "5ab4c0b8-bf3b-42ef-90b9-697559762d72";
            var tenantIdMOC = "c5d83817-b680-4929-9c3c-407e37ea2678";
            var redirectUriMOC = "https://localhost/webpuertoapi";

            var scopes = new[] { "user.read" };

            var app = PublicClientApplicationBuilder
                .Create(clientIdMOC)
                .WithAuthority($"https://login.microsoftonline.com/{tenantIdMOC}")
                .WithRedirectUri(redirectUriMOC)
                .Build();

            var result = await app.AcquireTokenInteractive(scopes).ExecuteAsync();
  

            string accessToken = result.AccessToken;
            if (accessToken != null)
            {
                //// Check if the access token is still valid
                //JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();
                //JwtSecurityToken jwt = handler.ReadJwtToken(accessToken);
                //if (jwt.ValidTo > DateTime.UtcNow)
                //{
                // The access token is still valid ClaimsPrincipal
            //    ClaimsPrincipal claimsPrincipal = CreateClaimsPrincipal(accessToken);
            //    HttpContext.Current.User = claimsPrincipal;
                return;
                //        }
                //      }
            }
            //string refreshToken = tokenCache.GetRefreshToken();
            //if (refreshToken != null)
            //{
            //    try
            //    {
            //        AuthenticationResult result = app.aq.AcquireTokenByRefreshToken(new[] { scope }, refreshToken).ExecuteAsync().Result;
            //        ClaimsPrincipal claimsPrincipal = CreateClaimsPrincipal(result.AccessToken);
            //        HttpContext.Current.User = claimsPrincipal;
            //        return;
            //    }
            //    catch (Exception)
            //    {

            //        throw;
            //    }
             
            //}

        }
        //private ClaimsPrincipal CreateClaimsPrincipal(string accessToken)
        //{
        //    //JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();
        //    //JwtSecurityToken jwt = handler.ReadJwtToken(accessToken);
        //    //ClaimsPrincipal claimsPrincipal = new ClaimsPrincipal(
        //    //    new ClaimsIdentity(jwt.Claims, "Bearer", jwt.Claims.FirstOrDefault(c => c.Type == "name")?.Value, jwt.Claims.FirstOrDefault(c => c.Type == "role")?.Value));
        //    //return claimsPrincipal;
        //}
    }
}