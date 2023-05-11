using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.Configuration;

namespace Molinos.Scato.AzureAD.Controllers
{
    public class AzureController : ApiController
    {
        [HttpGet]
        //[Route ("consultarPermisos/{id}")]
        [Route("azure/{mail}/{password}")]
        public HttpResponseMessage Get(string mail, string password)
        {

            try
            {
                var clientId = "";
                var tenantId = "";
                //var redirectUri = "https://login.microsoftonline.com/common/oauth2/nativeclient";
                var redirectUri = WebConfigurationManager.AppSettings["redirectUri"];

                string[] Scopes = new string[] { "User.Read" };

                
                if (mail.Split('@').Length > 1)
                {
                    if (mail.Split('@')[1] == "molinosagro.com.ar")
                    {
                        //MOLINOS
                        clientId = WebConfigurationManager.AppSettings["clientIdMOA"];
                        tenantId = WebConfigurationManager.AppSettings["tenantIdMOA"];
                        //clientId = "64b190f4-f980-4f59-9984-c0f0a78cf731";
                        //tenantId = "790c9737-0b8e-4138-a0f4-819cdc1eb64b";
                    }
                    else// (mail.Split('@')[1] == "mocomodities.com")
                    {
                        //MOC
                        //clientId = "5ab4c0b8-bf3b-42ef-90b9-697559762d72";
                        //tenantId = "c5d83817-b680-4929-9c3c-407e37ea2678";
                        clientId = WebConfigurationManager.AppSettings["clientIdMOC"];
                        tenantId = WebConfigurationManager.AppSettings["tenantIdMOC"];
                    }
                    //else
                    //{
                    //    Console.WriteLine("mail Invalido");

                    //}
                }
                var ap = PublicClientApplicationBuilder
                      .Create(clientId)
                  .WithTenantId(tenantId)
                   .WithAuthority($"https://login.microsoftonline.com/{tenantId}")
                   //.WithClientSecret(appsecretmoc)
                   .WithRedirectUri(redirectUri)
                  .Build();

                #region Store MS GraphToken In Memory Caching With Username and Password flow
                var App = new login.PublicAppUsingUsernamePassword(ap);
                var result = App.AcquireATokenFromCacheOrUsernamePasswordAsync(Scopes, mail, password).GetAwaiter().GetResult();

                var gruposAD = new login.GroupsAD();
                var grupos = gruposAD.obtenerGrupos(result);

                #endregion

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    username = mail,
                    permisos = grupos
                });

              //  return grupos;

            }
            catch (MsalClientException ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new
                {
                    message=ex.Message
                });
                
            }
           
        }

        [HttpPost]
        //[Route ("consultarPermisos/{id}")]
        [Route("azure")]
        public HttpResponseMessage Post([FromBody] List<string> parametros)
        {
            string mail = parametros[0];
            string password = parametros[1];
            try
            {
                var clientId = "";
                var tenantId = "";
                //var redirectUri = "https://login.microsoftonline.com/common/oauth2/nativeclient";
                var redirectUri = WebConfigurationManager.AppSettings["redirectUri"];

                string[] Scopes = new string[] { "User.Read" };


                if (mail.Split('@').Length > 1)
                {
                    if (mail.Split('@')[1] == "molinosagro.com.ar")
                    {
                        //MOLINOS
                        clientId = WebConfigurationManager.AppSettings["clientIdMOA"];
                        tenantId = WebConfigurationManager.AppSettings["tenantIdMOA"];
                        //clientId = "64b190f4-f980-4f59-9984-c0f0a78cf731";
                        //tenantId = "790c9737-0b8e-4138-a0f4-819cdc1eb64b";
                    }
                    else// (mail.Split('@')[1] == "mocomodities.com")
                    {
                        //MOC
                        //clientId = "5ab4c0b8-bf3b-42ef-90b9-697559762d72";
                        //tenantId = "c5d83817-b680-4929-9c3c-407e37ea2678";
                        clientId = WebConfigurationManager.AppSettings["clientIdMOC"];
                        tenantId = WebConfigurationManager.AppSettings["tenantIdMOC"];
                    }
                    //else
                    //{
                    //    Console.WriteLine("mail Invalido");

                    //}
                }
                var ap = PublicClientApplicationBuilder
                      .Create(clientId)
                  .WithTenantId(tenantId)
                   .WithAuthority($"https://login.microsoftonline.com/{tenantId}")
                   //.WithClientSecret(appsecretmoc)
                   .WithRedirectUri(redirectUri)
                  .Build();

                #region Store MS GraphToken In Memory Caching With Username and Password flow
                var App = new login.PublicAppUsingUsernamePassword(ap);
                var result = App.AcquireATokenFromCacheOrUsernamePasswordAsync(Scopes, mail, password).GetAwaiter().GetResult();

                var gruposAD = new login.GroupsAD();
                var grupos = gruposAD.obtenerGrupos(result);

                #endregion

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    username = mail,
                    permisos = grupos
                });

                //  return grupos;

            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, new
                {
                    message = ex.Message
                });

            }

        }


    }
}