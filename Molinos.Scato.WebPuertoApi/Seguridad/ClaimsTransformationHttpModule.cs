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


        //void Context_PostAuthenticateRequest(object sender, EventArgs e)
        //{
        //    var context = ((HttpApplication)sender).Context;

        //    // no need to call transformation if session already exists
        //    if (FederatedAuthentication.SessionAuthenticationModule != null && FederatedAuthentication.SessionAuthenticationModule.ContainsSessionTokenCookie(context.Request.Cookies))
        //    {
        //        return;
        //    }

        //    var transformer =
        //    FederatedAuthentication.FederationConfiguration.IdentityConfiguration.ClaimsAuthenticationManager;
        //    if (transformer != null)
        //    {
        //        var transformedPrincipal = transformer.Authenticate(context.Request.RawUrl, context.User as ClaimsPrincipal);

        //        context.User = transformedPrincipal;
        //        Thread.CurrentPrincipal = transformedPrincipal;
        //    }
        //}

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