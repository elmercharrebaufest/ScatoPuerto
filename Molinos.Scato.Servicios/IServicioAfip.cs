using Molinos.Scato.Dominio.Dto;
using System.Collections.Generic;
using System.ServiceModel;

namespace Molinos.Scato.Servicios
{
    public interface IServicioAfip
    {
        [OperationContract]
        void AnularCaratula(string id);

        [OperationContract]
        IList<AfipCaratulaDto> ListarCaratulas();

        [OperationContract]
        AfipCaratulaDto ObtenerCaratula(string id);

        [OperationContract]
        string RegistrarCaratula(AfipCaratulaDto caratula);

        [OperationContract]
        void SolicitarCambioBuque(object cambioBuque);

        [OperationContract]
        void SolicitarCambioFechas(object cambioFechas);

        [OperationContract]
        void SolicitarCambioLOT(object cambioLOT);
    }
}