using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Documentos;
using System;
using System.Collections.Generic;
using System.ServiceModel;
using System.Web;

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
        void GuardarConfiguracionDocumento(int nominacionId, List<ConfiguracionDocumentoDto> configuraciones, string usuario);

        [OperationContract]
        IList<DocumentoTipoDto> ListarDocumentoTipos();

        [OperationContract]
        IList<NominacionDocumentoEstadoDto> ListarNominacionDocumentoEstados();

        [OperationContract]
        IList<DocumentoDto> ListarDocumentosNominacion();

        [OperationContract]
        IList<DocumentoDestinoDto> ListarDocumentosDestino(int idDestino);

        [OperationContract]
        IList<DocumentoMaterialPuertoDto> ListarDocumentosProducto(int idProducto);

        [OperationContract]
        IList<NominacionDocumentoDto> ListarDocumentosPorConfiguracion(int configuracionId);

        [OperationContract]
        NominacionDocumentoDto ObtenerNominacionDocumento(int id);

        [OperationContract]
        ArchivoDto ObtenerArchivo(int id);

        [OperationContract]
        void EliminarArchivo(int id, string usuario);

        [OperationContract]
        void ActualizarEstado(int nomDocId, int estadoId, string usuario);

        [OperationContract]
        void CrearComentario(int nomDocId, string texto, string usuario);
        
        [OperationContract]
        NominacionDocumentoEmbarqueDto ObtenerNominacionDocumentoEmbarque(int nominacionId, int embarqueId);

        [OperationContract]
        IList<NominacionDocumentoEstadoPorEmbarqueDto> ListarNominacionDocumentoEstadoPorEmbarque(int nominacionId, int configuracionDocumentoId, List<string> documento = null, List<string> documentoEstado = null);

        [OperationContract]
        IList<DocumentoDto> ListarDocumentosPorNominacion(int nominacionId);

        [OperationContract]
        IList<DestinoDto> ListarDestinoPorNominacion(int nominacionId);

        [OperationContract]
        IList<MaterialPuertoDto> ListarProductosPorNominacion(int nominacionId);

        [OperationContract]
        IList<ConfiguracionDocumentoPorNominacionDto> ListarConfiguracionDocumentoPorNominacion(int nominacionId);
    }
}