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
        bool RegistrarCaratula(AfipRegistrarCaratulaDto caratula, string usuario);

        [OperationContract]
        bool RectificarCaratula(AfipRectificarCaratulaDto caratula, string usuario);

        [OperationContract]
        bool AnularCaratula(int id, string usuario);

        [OperationContract]
        IList<string> ListarEstadosCaratula();

        [OperationContract]
        bool CambiarEstadoCaratula(int id, string estado, string usuario);

        [OperationContract]
        IList<AfipCaratulaDto> ComboCaratulas();

        [OperationContract]
        void CaratulaCambiarTipoProducto(int id, string usuario);
        #endregion

        #region COEMs
        [OperationContract]
        ListaPaginada<AfipCoemDto> ListarCoems(int? idCaratula, Paginacion paginacion, string identificador, string declaracion, string estado);

        [OperationContract]
        AfipCoemDto ObtenerCoem(int id);

        [OperationContract]
        bool RegistrarCoem(AfipCoemRegistrarRequest coem, string usuario);

        [OperationContract]
        bool RectificarCoem(AfipCoemDto coem, string usuario);

        [OperationContract]
        bool AnularCoem(int id, int idEstado, string usuario);

        [OperationContract]
        bool CerrarCoem(int id, int idEstado, string usuario);

        [OperationContract]
        bool SolicitarAnulacionCoem(int id, string usuario);

        [OperationContract]
        IList<AfipCoemEstadoDto> ListarEstadosCoem();

        [OperationContract]
        void CambiarEstadoCoem(int idCoem, int idEstado, string usuario);

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
        bool SolicitarCierreCargaGranel(AfipSolicitarCierreCargaGranelDto solicitarCierreCargaGranelDto, string usuario);

        [OperationContract]
        IList<AfipSolicitudCierreCargaDto> ListarSolicitudesCierreCarga(int id = 0);

        [OperationContract]
        void EfectuarSolicitudCierreCarga(int id, string usuario);

        [OperationContract]
        void RechazarSolicitudCierreCarga(int id, string usuario);
        #endregion

        #region Solicitar No a bordo
        [OperationContract]
        bool SolicitarNoAbordo(AfipSolicitarNoAbordoDto solicitarNoAbordoDto, string usuario);

        [OperationContract]
        void EfectuarSolicitudNoABordo(int id, string usuario);

        [OperationContract]
        void RechazarSolicitudNoABordo(int id, string usuario);
        #endregion

        #region Solicitar Cambio de Buque
        [OperationContract]
        void SolicitarCambioBuque(AfipSolicitarCambioBuqueDto solicitarCambioBuqueDto, string usuario);

        [OperationContract]
        IList<AfipSolicitudCambioBuqueDto> ListarSolicitudesCambioBuque(int id = 0);

        [OperationContract]
        void EfectuarSolicitudCambioBuque(int id, string usuario);

        [OperationContract]
        void RechazarSolicitudCambioBuque(int id, string usuario);
        #endregion

        #region Solicitar Cambio de Fechas
        [OperationContract]
        void SolicitarCambioFechas(AfipSolicitarCambioFechasDto solicitarCambioFechasDto, string usuario);

        [OperationContract]
        IList<AfipSolicitudCambioFechasDto> ListarSolicitudesCambioFechas(int id = 0);

        [OperationContract]
        void EfectuarSolicitudCambioFechas(int id, string usuario);

        [OperationContract]
        void RechazarSolicitudCambioFechas(int id, string usuario);
        #endregion

        #region Consultas
        [OperationContract]
        void ActualizarEstadosCoem(int id);

        [OperationContract]
        void ActualizarEstadosSolicitudes(int id);

        [OperationContract]
        void ActualizarTodo();
        #endregion

        #endregion
    }
}