using System.Collections.Generic;
using System.ServiceModel;

namespace Molinos.Scato.Servicios
{
    public interface IServicioAfip
    {
        [OperationContract]
        void AnularCaratula(string id);

        [OperationContract]
        IList<object> ListarCaratulas();

        [OperationContract]
        object ObtenerCaratula(string id);

        [OperationContract]
        string RegistrarCaratula(object caratula);

        [OperationContract]
        void SolicitarCambioBuque(object cambioBuque);

        [OperationContract]
        void SolicitarCambioFechas(object cambioFechas);

        [OperationContract]
        void SolicitarCambioLOT(object cambioLOT);
    }
}