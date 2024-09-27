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
        ListaPaginada<DocumentoDto> ListarDocumentos(string nombre, int pagina = 0, int itemsPorPagina = 0);

        [OperationContract]
        DocumentoDto ObtenerDocumento(int documentoId);

        [OperationContract]
        void CrearDocumento(DocumentoDto documento, string usuario);

        [OperationContract]
        void ModificarDocumento(DocumentoDto documento, string usuario);

        [OperationContract]
        void EliminarDocumento(int documentoId, string usuario);

        [OperationContract]
        IList<DocumentoTipoDto> ListarDocumentoTipos();

        [OperationContract]
        IList<NominacionDocumentoEstadoDto> ListarNominacionDocumentoEstados();
    }
}
