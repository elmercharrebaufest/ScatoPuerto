using Molinos.Scato.Dominio.Dto;
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

        [OperationContract]
        ComprobantePuertoDto GenerarRomaneo(int moduloDeCargaId, string usuario);

        [OperationContract]
        ComprobantePuertoDto ObtenerRomaneo(int comprobanteId);

        [OperationContract]
        List<ComprobantePuertoDto> ListarComprobantes(int moduloDeCargaId);

        [OperationContract]
        void GuardarFechaImpresionRomaneo(int comprobanteId, string usuario);

        [OperationContract]
        void AnularRomaneo(int comprobanteId, string usuario);
    }
}
