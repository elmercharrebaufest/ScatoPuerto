using System;
using System.Collections.Generic;
using System.ServiceModel;

namespace Molinos.Scato.Servicios
{
    [ServiceContract]
    public interface IServicioComprobante
    {
        [OperationContract]
        string ObtenerNumeroInicioComprobante();

        [OperationContract]
        void GuardarNumeroInicioComprobante(string numeroInicioComprobante, string usuario);
    }
}
