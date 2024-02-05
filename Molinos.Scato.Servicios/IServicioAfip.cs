using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Dto.AfipTablasReferencia;
using System;
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

        [OperationContract]
        IList<AfipMotivoSolicitudCambioDto> ListarMotivosSolicitudCambio();
        [OperationContract]
        IList<AfipMotivoNoAbordoDto> ListarMotivosNoAbordo();
        #endregion

        #region Caratulas

        [OperationContract]
        ListaPaginada<AfipCaratulaDto> ListarCaratulas(Paginacion paginacion, DateTime? fechaArribo = null, string buque = null, string identificador = null, string estado = null);

        [OperationContract]
        AfipCaratulaDto ObtenerCaratula(int id);

        [OperationContract]
        bool RegistrarCaratula(AfipRegistrarCaratulaDto caratula);

        [OperationContract]
        bool RectificarCaratula(AfipRectificarCaratulaDto caratula);

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
        ListaPaginada<AfipCoemDto> ListarCoems(int? idCaratula, Paginacion paginacion, string identificador, string declaracion, string estado);

        [OperationContract]
        AfipCoemDto ObtenerCoem(int id);

        [OperationContract]
        bool RegistrarCoem(AfipCoemRegistrarRequest coem);

        [OperationContract]
        bool RectificarCoem(AfipCoemDto coem);

        [OperationContract]
        bool AnularCoem(int id, int idEstado);

        [OperationContract]
        bool CerrarCoem(int id, int idEstado);

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

        #region Solicitudes

        #region Solicitar Cierre de Carga
        [OperationContract]
        bool SolicitarCierreCargaGranel(AfipSolicitarCierreCargaGranelDto solicitarCierreCargaGranelDto);

        [OperationContract]
        IList<AfipSolicitudCierreCargaDto> ListarSolicitudesCierreCarga(int id = 0);

        [OperationContract]
        void EfectuarSolicitudCierreCarga(int id);

        [OperationContract]
        void RechazarSolicitudCierreCarga(int id);
        #endregion

        [OperationContract]
        bool SolicitarNoAbordo(AfipSolicitarNoAbordoDto solicitarNoAbordoDto);

        #region Solicitar Cambio de Buque
        [OperationContract]
        void SolicitarCambioBuque(AfipSolicitarCambioBuqueDto solicitarCambioBuqueDto);

        [OperationContract]
        IList<AfipSolicitudCambioBuqueDto> ListarSolicitudesCambioBuque(int id = 0);

        [OperationContract]
        void EfectuarSolicitudCambioBuque(int id);

        [OperationContract]
        void RechazarSolicitudCambioBuque(int id);
        #endregion

        #region Solicitar Cambio de Fechas
        [OperationContract]
        void SolicitarCambioFechas(AfipSolicitarCambioFechasDto solicitarCambioFechasDto);

        [OperationContract]
        IList<AfipSolicitudCambioFechasDto> ListarSolicitudesCambioFechas(int id = 0);

        [OperationContract]
        void EfectuarSolicitudCambioFechas(int id);

        [OperationContract]
        void RechazarSolicitudCambioFechas(int id);
        #endregion

        #endregion
    }
}