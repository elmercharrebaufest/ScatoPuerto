using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.ServiceModel;

namespace Molinos.Scato.Servicios
{
    [ServiceContract]
    public interface IServicioDocumento
    {
        [OperationContract]
        ListaPaginada<DocumentoDto> ListarDocumentos(Paginacion paginacion, string filtro = null);

        [OperationContract]
        DocumentoDto ObtenerDocumento(int documentoId);

        [OperationContract]
        void CrearDocumento(DocumentoDto documento);

        [OperationContract]
        void ModificarDocumento(DocumentoDto documento);

        [OperationContract]
        void EliminarDocumento(int documentoId);

        [OperationContract]
        IList<DocumentoTipoDto> ListarDocumentoTipos();

        [OperationContract]
        IList<NominacionDocumentoEstadoDto> ListarNominacionDocumentoEstados();
    }
}
