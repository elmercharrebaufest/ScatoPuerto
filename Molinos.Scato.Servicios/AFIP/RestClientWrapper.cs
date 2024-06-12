using RestSharp;
using RestSharp.Authenticators;
using System.Configuration;

namespace Molinos.Scato.Servicios.AFIP
{
	public class RestClientWrapper : IRestClientWrapper
	{
		private readonly string _url = ConfigurationManager.AppSettings["UrlAfipApi"];
		private readonly string _username = ConfigurationManager.AppSettings["UserCredentialAfipApi"];
		private readonly string _password = ConfigurationManager.AppSettings["PassCredentialAfipApi"];
		private readonly RestClient _restClient;

		public RestClientWrapper(string url)
		{
			_restClient = new RestClient(_url)
			{
				Authenticator = new HttpBasicAuthenticator(_username, Encriptador.Decrypt(_password))
			};
		}

		public IRestResponse Execute(IRestRequest request)
		{
			return _restClient.Execute(request);
		}
	}
}
