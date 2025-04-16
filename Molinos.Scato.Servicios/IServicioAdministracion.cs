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
        ListaPaginada<InformacionEmbarqueDto> ListarEmbarquesAdministracion(Paginacion paginacion, DateTime? desamarre = null,
            string buques = null,
            string muelles = null,
            string tanques = null,
            string exportadores = null,
            string clientes = null,
            string materiales = null,
            string estados = null);

        [OperationContract]
        List<InformacionEmbarqueDto> ListarEmbarquesAdministracionSinPaginar(DateTime? desamarre = null,
        string buques = null, string muelles = null, string tanques = null, string exportadores = null, string clientes = null,
        string materiales = null, string estados = null);

        [OperationContract]
        DetalleEmbarqueAFacturarDto ObtenerDetalleEmbarque(int embarqueId);

        [OperationContract]
        IList<NotificacionAdministracionDto> ObtenerNotificaciones();

        [OperationContract]
        void EliminarNotificacion(int id, string usuario);
    }
}