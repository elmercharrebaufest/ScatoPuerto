using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using System.Collections.Generic;
using System.ServiceModel;

namespace Molinos.Scato.Servicios
{
    [ServiceContract]
    public interface IServicioAfip
    {
        #region Caratulas

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
        #endregion

        #region COEMs
        [OperationContract]
        IList<AfipCoemDto> ListarCoems();

        [OperationContract]
        IList<AfipCoemDto> ListarCoemsPorCaratula(int idCaratula);

        [OperationContract]
        AfipCoemDto ObtenerCoem(int id);

        [OperationContract]
        void RegistrarCoem(AfipCoemDto coem);

        [OperationContract]
        IList<AfipCoemEstadoDto> ListarEstadosCoem();

        [OperationContract]
        void CambiarEstadoCoem(int idCoem, int idEstado);
        #endregion
    }
}