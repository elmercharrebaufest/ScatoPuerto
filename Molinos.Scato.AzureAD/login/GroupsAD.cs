using Microsoft.Identity.Client;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;

namespace Molinos.Scato.AzureAD.login
{
    public class GroupsAD
    {
        public IList<string> obtenerGrupos(AuthenticationResult result)
        {
            IList<string> gruposAD = new List<string>();
            var spClient = new HttpClient();
            spClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            spClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            spClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", result.AccessToken);
            spClient.DefaultRequestHeaders.Add("ConsistencyLevel", "eventual"); // Necesario para filtrar los grupos

            var search = "https://graph.microsoft.com/v1.0/me/memberOf/microsoft.graph.group?$search=\"displayName:LAD_MOAAPP_PUERTO\"&$select=displayName";

            var res2211 = spClient.GetStringAsync(search).Result;
            var prue = JObject.Parse(res2211);

            foreach (var item in prue["value"])
            {
                gruposAD.Add(item["displayName"].ToString());
            }

            return gruposAD;
        }

    }
}