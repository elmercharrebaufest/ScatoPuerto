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
        ComprobanteDeEmbarqueDto GenerarRomaneo(int moduloDeCargaId, string usuario);

        [OperationContract]
        ComprobanteDeEmbarqueDto GenerarSecuenciaRealCarga(int moduloDeCargaId, string usuario);

        [OperationContract]
        ComprobanteDeEmbarqueDto ObtenerComprobante(int comprobanteId);

        [OperationContract]
        List<ComprobanteDeEmbarqueDto> ListarComprobantes(int moduloDeCargaId);

        [OperationContract]
        void GuardarFechaImpresionComprobante(int comprobanteId, string usuario);

        [OperationContract]
        void AnularComprobante(int comprobanteId, string usuario);

        [OperationContract]
        ArchivoDto ObtenerArchivoComprobante(int comprobanteId);
    }
}
