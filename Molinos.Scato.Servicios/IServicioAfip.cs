using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using System.Collections.Generic;
using System.ServiceModel;

namespace Molinos.Scato.Servicios
{
    [ServiceContract]
    public interface IServicioAfip
    {

        #region Tablas de referencia

        [OperationContract]
        IList<AfipTipoEmbalajeDto> ListarTiposEmbalaje();

        [OperationContract]
        IList<AfipPuntoAduaneroDto> ListarPuntosAduaneros();

        [OperationContract]
        IList<AfipPuertoDto> ListarPuertos();

        [OperationContract]
        IList<AfipPaisDto> ListarPaises();

        [OperationContract]
        IList<AfipTipoDocumentoDto> ListarTiposDocumento();

        [OperationContract]
        IList<AfipNaturalezaEmbalajeDto> ListarNaturalezasEmbalaje();

        [OperationContract]
        IList<AfipLugarOperativoDto> ListarLugaresOperativos();

        [OperationContract]
        IList<AfipCondicionContenedorDto> ListarCondicionesContenedor();
        #endregion

        #region Caratulas

        [OperationContract]
        IList<AfipCaratulaDto> ListarCaratulas();

        [OperationContract]
        AfipCaratulaDto ObtenerCaratula(int id);

        [OperationContract]
        bool RegistrarCaratula(AfipCaratulaDto caratula);

        [OperationContract]
        bool RectificarCaratula(AfipCaratulaDto caratula);

        [OperationContract]
        bool AnularCaratula(int id);

        [OperationContract]
        IList<string> ListarEstadosCaratula();

        [OperationContract]
        bool CambiarEstadoCaratula(int id, string estado);

        [OperationContract]
        IList<AfipCaratulaDto> ComboCaratulas();
        #endregion

        #region COEMs
        [OperationContract]
        IList<AfipCoemDto> ListarCoems();

        [OperationContract]
        IList<AfipCoemDto> ListarCoemsPorCaratula(int idCaratula);

        [OperationContract]
        AfipCoemDto ObtenerCoem(int id);

        [OperationContract]
        bool RegistrarCoem(AfipCoemDto coem);

        [OperationContract]
        bool RectificarCoem(AfipCoemDto coem);

        [OperationContract]
        bool AnularCoem(int id);

        [OperationContract]
        bool CerrarCoem(int id);

        [OperationContract]
        bool SolicitarAnulacionCoem(int id);

        [OperationContract]
        IList<AfipCoemEstadoDto> ListarEstadosCoem();

        [OperationContract]
        void CambiarEstadoCoem(int idCoem, int idEstado);

        [OperationContract]
        IList<AfipCodeDto> ListarCode();

        [OperationContract]
        AfipCodeDto ObtenerCode(int idCode);

        [OperationContract]
        void RegistrarCode(AfipCodeDto code);
        #endregion
    }
}