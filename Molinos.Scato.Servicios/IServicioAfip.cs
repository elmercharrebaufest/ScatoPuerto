using Molinos.Scato.Dominio.Dto;
using System.Collections.Generic;
using System.ServiceModel;

namespace Molinos.Scato.Servicios
{
    [ServiceContract]
    public interface IServicioAfip
    {
        [OperationContract]
        IList<AfipCaratulaDto> ListarCaratulas();

        [OperationContract]
        AfipCaratulaDto ObtenerCaratula(int id);

        [OperationContract]
        bool RegistrarCaratula(AfipCaratulaDto caratula);

        [OperationContract]
        IList<AfipCaratulaEstadoDto> ListarEstadosCaratula();

        [OperationContract]
        bool CambiarEstadoCaratula(int id, int idEstado);
    }
}