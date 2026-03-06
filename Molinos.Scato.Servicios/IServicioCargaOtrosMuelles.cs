using Molinos.Scato.Dominio.Dto;
using System.ServiceModel;

namespace Molinos.Scato.Servicios
{
    [ServiceContract]
    public interface IServicioCargaOtrosMuelles
    {
        [OperationContract]
        OtroMuelleCargaDto ObtenerCarga(int embarqueId);

        [OperationContract]
        OtroMuelleNominacionDto ObtenerDatosNominacion(int embarqueId);

        [OperationContract]
        void GuardarCarga(OtroMuelleCargaDto otroMuelleCarga, int embarqueId, bool zarpar, string usuario);

        [OperationContract]
        void GuardarDetalleCarga(OtroMuelleCargaDetalleDto otroMuelleCargaDetalle, int embarqueId, string usuario);

        [OperationContract]
        void EliminarDetalleCarga(int otroMuelleCargaDetalleId, string usuario);

        [OperationContract]
        bool ValidarHorarios(OtroMuelleCargaDetalleDto detalle, int embarqueId);

        [OperationContract]
        EmbarqueDto ObtenerEmbarque(int embarqueId);

        [OperationContract]
        string ObtenerDestinatarios();
    }
}
