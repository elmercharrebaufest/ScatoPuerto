using Newtonsoft.Json;
using RestSharp;
using RestSharp.Authenticators;
using System.Configuration;
using System.Net;

namespace Molinos.Scato.Servicios.AFIP
{
    public class AfipClient : IAfipClient
    {
        private readonly string _url = ConfigurationManager.AppSettings["UrlAfipApi"];
        private readonly string _username = ConfigurationManager.AppSettings["UserCredentialAfipApi"];
        private readonly string _password = ConfigurationManager.AppSettings["PassCredentialAfipApi"];
        private RestClient _restClient;

        public AfipClient()
        {
            _restClient = new RestClient(_url)
            {
                Authenticator = new HttpBasicAuthenticator(_username, Encriptador.Decrypt(_password))
            };
        }

        public ResponseTicketAccesoAfip GetTicketAccesoAfip()
        {
            ServicePointManager.SecurityProtocol |= SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;
            var request = new RestRequest("ObtenerTicketDeAccesoAFIP") { Method = Method.GET };
            request.AddHeader("content-type", "application/json; charset=utf-8");
            var response = _restClient.Execute(request);
            var result = JsonConvert.DeserializeObject<ResponseTicketAccesoAfip>(response.Content);
            return result;
        }
    }
}