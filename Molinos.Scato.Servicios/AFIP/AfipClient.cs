using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using RestSharp;
using RestSharp.Authenticators;
using System;
using System.Configuration;
using System.Net;

namespace Molinos.Scato.Servicios.AFIP
{
    public class AfipClient : IAfipClient
    {
        private readonly string _url = ConfigurationManager.AppSettings["UrlAfipApi"];
        private readonly string _username = ConfigurationManager.AppSettings["UserCredentialAfipApi"];
        private readonly string _password = ConfigurationManager.AppSettings["PassCredentialAfipApi"];
        private readonly RestClient _restClient;
        private readonly ILogger _log;

        public AfipClient(ILogger log)
        {
            _restClient = new RestClient(_url)
            {
                Authenticator = new HttpBasicAuthenticator(_username, Encriptador.Decrypt(_password))
            };
            _log = log;
        }

        public ResponseTicketAccesoAfip GetTicketAccesoAfip(string servicio = null)
        {
            try
            {
                _log.Info("Inicializando GetTicketAccesoAfip " + servicio ?? "wgescomunicacionembarque");
                ServicePointManager.SecurityProtocol |= SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;
                var request = new RestRequest("ObtenerTicketDeAccesoAFIP") { Method = Method.GET };
                request.AddHeader("content-type", "application/json; charset=utf-8");
                if (!String.IsNullOrEmpty(servicio))
                {
                    request.AddParameter("service", servicio, ParameterType.QueryString);
                }
                var req = JsonConverter<RestRequest>.Serialize(request);
                _log.Info($" request: {req}");
                var restResponse = _restClient.Execute(request);
                var response = JsonConverter<ResponseTicketAccesoAfip>.Deserialize(restResponse.Content);
                _log.Info($" response: {restResponse}");
                _log.Info("Finalizando GetTicketAccesoAfip");
                return response;
            }
            catch (Exception ex)
            {
                _log.Error($"Error al ejecutar GetTicketAccesoAfip. Error: {ex.Message}");
                throw;
            }
        }
    }
}
