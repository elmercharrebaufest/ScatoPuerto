using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using RestSharp;
using System;
using System.Net;

namespace Molinos.Scato.Servicios.AFIP
{
	public class AfipClient : IAfipClient
    {
		private readonly IRestClientWrapper _restClientWrapper;
		private readonly ILogger _log;

		public AfipClient(
            IRestClientWrapper restClientWrapper,
			ILogger log
            )
		{
			_restClientWrapper = restClientWrapper;
			_log = log;
		}

		public ResponseTicketAccesoAfip GetTicketAccesoAfip()
        {
			try
			{
				_log.Info("Inicializando GetTicketAccesoAfip");
				ServicePointManager.SecurityProtocol |= SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;
				var request = new RestRequest("ObtenerTicketDeAccesoAFIP") { Method = Method.GET };
				request.AddHeader("content-type", "application/json; charset=utf-8");
				var req = JsonConverter<RestRequest>.Serialize(request);
				_log.Info($" request: { req }");
				var restResponse = _restClientWrapper.Execute(request);
				//var response = JsonConvert.DeserializeObject<ResponseTicketAccesoAfip>(restResponse.Content);
				var response = JsonConverter<ResponseTicketAccesoAfip>.Deserialize(restResponse.Content);
				_log.Info($" response: { response }");
				_log.Info("Finalizando GetTicketAccesoAfip");
				return response;
			}
			catch (Exception ex)
			{
				_log.Error($"Error al ejecutar GetTicketAccesoAfip. Error: { ex.Message }");
				throw;
			}
        }
    }
}
