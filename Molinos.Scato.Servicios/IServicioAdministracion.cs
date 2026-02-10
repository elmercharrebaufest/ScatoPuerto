using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Administracion;
using System;
using System.Collections.Generic;
using System.ServiceModel;

namespace Molinos.Scato.Servicios
{
    [ServiceContract]
    public interface IServicioAdministracion
    {
        [OperationContract]
        CombosConsultaEmbarquesDto ObtenerCombos();

        [OperationContract]
        CombosConsultaProvisionesDto ObtenerCombosProvisiones();

        [OperationContract]
        ListaPaginada<InformacionEmbarqueDto> ListarEmbarquesAdministracion(Paginacion paginacion,
            FiltrosAdministracionDto filtros = null);

        [OperationContract]
        List<InformacionEmbarqueDto> ListarEmbarquesAdministracionSinPaginar(FiltrosAdministracionDto filtros);

        [OperationContract]
        DetalleEmbarqueAFacturarDto ObtenerDetalleEmbarque(int embarqueId);

        [OperationContract]
        IList<NotificacionAdministracionDto> ObtenerNotificaciones();

        [OperationContract]
        void EliminarNotificacion(int id, string usuario);

        [OperationContract]
        AdministracionEnvioAlertaDto ObtenerDatosMailAlertaAdministracion();

        [OperationContract]
        void EnviarCorreoAlertaAdministracion(AdministracionEnvioAlertaDto administracionEnvioAlerta);

        [OperationContract]
        IList<ConceptoDto> ListarConceptosProducto();

        [OperationContract]
        IList<ConceptoDto> ListarConceptosEmbarque();

        [OperationContract]
        IList<ConceptoDto> ListarConceptos();

        [OperationContract]
        TarifaPorProductoDto ObtenerTarifaProducto(int productoId, DateTime periodo);

        [OperationContract]
        TarifaPorEmbarqueDto ObtenerTarifaEmbarque(int embarqueId, int productoId, int exportadorId, DateTime periodo);

        [OperationContract]
        IList<EmbarqueATarifarDto> ListarEmbarquesATarifar(DateTime periodo, int muelleId);

        [OperationContract]
        IList<TipoContratoTarifaDto> ListarTipoContratoTarifa();

        [OperationContract]
        AltaProvisionYGastoDto ObtenerProvision(int? muelleId, DateTime periodo, int? embarqueId, int? productoId, int? exportadorId, int? contratoId);

        [OperationContract]
        List<TarifaPorEmbarqueDto> ListarTarifasIds(List<int> ids);

        [OperationContract]
        List<ProvisionGastoDto> ListarProvisionesDadaTarifasIds(List<int> ids);

        [OperationContract]
        List<LineUpDto> ListarLineUpDadoEmbarqueIds(List<int> idsEmbarque);

        [OperationContract]
        List<NominacionDto> ListarNominacionesDadoEmbarqueIds(List<int> idsEmbarque);

        [OperationContract]
        void EnviarAlertaBuqueATarifar(int embarqueId);

        [OperationContract]
        AcuerdoCombosDto ObtenerCombosAcuerdos(bool conBuques);

        [OperationContract]
        AcuerdoDto ObtenerAcuerdo(int acuerdoId);

        [OperationContract]
        ArchivoDto ObtenerArchivoAcuerdo(int acuerdoId);

        [OperationContract]
        ListaPaginada<AcuerdoDto> ListarAcuerdos(FiltrosAcuerdoDto filtros);

        [OperationContract]
        void EliminarAcuerdo(int acuerdoId, string usuarioEliminacion);

		[OperationContract]
		ListaPaginada<AcuerdoPorEmbarcacionDto> ListarAcuerdoPorEmbarcacion(int idEmbarque, bool filtrarPorEmbarque, Paginacion paginacion, FiltrosAcuerdoPorEmbarcacionDto filtros);

		[OperationContract]
		void AsociarEmbarcacionConAcuerdo(int idEmbarque, int idAcuerdo, int idMaterial, decimal cantidad, string usuario);

		[OperationContract]
		void DesasociarEmbarcacionConAcuerdo(int idAcuerdoEmbarque, string usuario);

		[OperationContract]
		void EditarAsociacionEmbarcacionConAcuerdo(int idAcuerdoEmbarque, decimal nuevaCantidad, string usuario);

		[OperationContract]
		TarifaCotizacionDolarDto ObtenerTarifaCotizacionDolar(DateTime periodo);

		[OperationContract]
		List<string> ObtenerPeriodosDisponiblesTarifaDolar();
	}
}