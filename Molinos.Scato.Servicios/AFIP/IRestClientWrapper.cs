using RestSharp;

namespace Molinos.Scato.Servicios.AFIP
{
	public interface IRestClientWrapper
	{
		IRestResponse Execute(IRestRequest request);
	}
}
