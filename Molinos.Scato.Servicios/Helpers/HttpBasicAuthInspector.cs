using System;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.ServiceModel.Description;
using System.ServiceModel.Dispatcher;

namespace Molinos.Scato.Servicios.Helpers
{
    public class HttpBasicAuthInspector : IClientMessageInspector
    {
        private readonly string _username;
        private readonly string _password;

        public HttpBasicAuthInspector(string username, string password)
        {
            _username = username;
            _password = password;
        }

        public object BeforeSendRequest(ref Message request, IClientChannel channel)
        {
            // Crear credenciales en formato Base64
            var credentials = Convert.ToBase64String(
                System.Text.Encoding.ASCII.GetBytes($"{_username}:{_password}")
            );

            // Crear el header HTTP
            HttpRequestMessageProperty httpRequestProperty;

            if (request.Properties.ContainsKey(HttpRequestMessageProperty.Name))
            {
                httpRequestProperty = (HttpRequestMessageProperty)request.Properties[HttpRequestMessageProperty.Name];
            }
            else
            {
                httpRequestProperty = new HttpRequestMessageProperty();
                request.Properties.Add(HttpRequestMessageProperty.Name, httpRequestProperty);
            }

            // Agregar el header de autenticación Basic
            httpRequestProperty.Headers[System.Net.HttpRequestHeader.Authorization] = $"Basic {credentials}";

            return null;
        }

        public void AfterReceiveReply(ref Message reply, object correlationState)
        {
            // No hacer nada después de recibir la respuesta
        }
    }

    public class HttpBasicAuthBehavior : System.ServiceModel.Description.IEndpointBehavior
    {
        private readonly string _username;
        private readonly string _password;

        public HttpBasicAuthBehavior(string username, string password)
        {
            _username = username;
            _password = password;
        }

        public void AddBindingParameters(System.ServiceModel.Description.ServiceEndpoint endpoint, System.ServiceModel.Channels.BindingParameterCollection bindingParameters)
        {
        }

        public void ApplyClientBehavior(System.ServiceModel.Description.ServiceEndpoint endpoint, System.ServiceModel.Dispatcher.ClientRuntime clientRuntime)
        {
            clientRuntime.MessageInspectors.Add(new HttpBasicAuthInspector(_username, _password));
        }

        public void ApplyDispatchBehavior(System.ServiceModel.Description.ServiceEndpoint endpoint, System.ServiceModel.Dispatcher.EndpointDispatcher endpointDispatcher)
        {
        }

        public void Validate(System.ServiceModel.Description.ServiceEndpoint endpoint)
        {
        }
    }
}
