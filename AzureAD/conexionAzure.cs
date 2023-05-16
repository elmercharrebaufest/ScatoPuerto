using Microsoft.Identity.Client;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace AzureAD
{
    public class conexionAzure
    {
        public async Task<List<string>> ListarPermisosPorUsuarioAzureAD(string username, string password)
        {

            try
            {
                List<string> gruposPermisos = new List<string>();
                string clientId = "";
                string tenantId = "";
                var redirectUri = "https://login.microsoftonline.com/common/oauth2/nativeclient";

                if (username.Split('@').Length > 1)
                {
                    if (username.Split('@')[1] == "molinosagro.com.ar")
                    {
                        //MOLINOS
                        clientId = "64b190f4-f980-4f59-9984-c0f0a78cf731";
                        tenantId = "790c9737-0b8e-4138-a0f4-819cdc1eb64b";
                    }
                    else if (username.Split('@')[1] == "mocomodities.com")
                    {
                        //MOC
                        clientId = "5ab4c0b8-bf3b-42ef-90b9-697559762d72";
                        tenantId = "c5d83817-b680-4929-9c3c-407e37ea2678";
                    }
                    else
                    {
                        Console.WriteLine("mail Invalido");
                        return null;
                    }

                    ///MOLINOS+
                    var scopes = new[] { "user.read" };
                    var ap = PublicClientApplicationBuilder
                          .Create(clientId)
                      .WithTenantId(tenantId)
                       .WithAuthority($"https://login.microsoftonline.com/{tenantId}")
                       .WithRedirectUri(redirectUri)
                      .Build();

                    // var result1 = await ap.AcquireTokenByUsernamePassword(scopes,@username, password).ExecuteAsync(CancellationToken.None);
                    var result1 = await ap.AcquireTokenByUsernamePassword(scopes, @"lucas.olivella@molinosagro.com.ar", "inicio00").ExecuteAsync(CancellationToken.None);
                    var spClient = new HttpClient();
                    spClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    spClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    spClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", result1.AccessToken);
                    var search = "https://graph.microsoft.com/v1.0/me/memberOf?$select=displayName";
                    var res2211 = spClient.GetStringAsync(search).Result;
                    var prue = JObject.Parse(res2211);

                    foreach (var item in prue["value"])
                    {
                        if (item["displayName"].ToString().Contains("LAD_MOAAPP_PUERTO_"))
                            gruposPermisos.Add(item["displayName"].ToString());

                    }


                }
                return gruposPermisos;
            }
            catch (Exception ex)
            {
                //log.Error("Error en listar permisos Azure AD", ex.InnerException);
                throw ex.InnerException;
            }


        }
    }
}