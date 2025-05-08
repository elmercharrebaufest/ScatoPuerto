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
        TarifaPorProductoDto ObtenerTarifaProducto(int productoId, DateTime periodo);
    }
}