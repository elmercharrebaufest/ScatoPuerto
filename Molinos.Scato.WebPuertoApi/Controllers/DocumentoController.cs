using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Servicios;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class DocumentoController : BaseController
    {
        private readonly IServicioComandos comandos;

        public DocumentoController(IServicioRepositorio servicio, IServicioComandos comandos, IServicioDocumento servicioDocumento) : base(servicio, servicioDocumento: servicioDocumento)
        {
            this.comandos = comandos;
        }

        [HttpGet]
        [Route("api/documento/ListarDocumentoTipos")]
        public HttpResponseMessage ListarDocumentoTipos()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioDocumento.ListarDocumentoTipos());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/documento/ListarNominacionDocumentoEstados")]
        public HttpResponseMessage ListarNominacionDocumentoEstados()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioDocumento.ListarNominacionDocumentoEstados());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/documento/ListarDocumentos")]
        public HttpResponseMessage ListarDestinos(int pagina = 1, int itemsPorPagina = 10, string nombre = null)
        {
            try
            {
                var listaPaginada = servicioDocumento.ListarDocumentos(nombre, pagina, itemsPorPagina);
                var response = new { listaPaginada.Items, listaPaginada.ItemsTotales };
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/documento/ObtenerDocumento")]
        public HttpResponseMessage ObtenerDocumento(int id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioDocumento.ObtenerDocumento(id));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/documento/CrearDocumento")]
        public HttpResponseMessage CrearDocumento(DocumentoDto documento)
        {
            try
            {
                servicioDocumento.CrearDocumento(documento, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPut]
        [Route("api/documento/ModificarDocumento")]
        public HttpResponseMessage ModificarDocumento(DocumentoDto documento)
        {
            try
            {
                servicioDocumento.ModificarDocumento(documento, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpDelete]
        [Route("api/documento/EliminarDocumento")]
        public HttpResponseMessage EliminarDocumento(int id)
        {
            try
            {
                servicioDocumento.EliminarDocumento(id, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPut]
        [Route("api/documento/GuardarConfiguracionDocumento")]
        public HttpResponseMessage GuardarConfiguracionDocumento(GuardarConfiguracionesDto body)
        {
            try
            {
                servicioDocumento.GuardarConfiguracionDocumento(body.NominacionId, body.Configuraciones, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
                throw;
            }
        }

        [HttpGet]
        [Route("api/documento/ListarDocumentosNominacion")]
        public HttpResponseMessage ListarDocumentosNominacion()
        {
            try
            {
                var docsNominacion = servicioDocumento.ListarDocumentosNominacion();
                return Request.CreateResponse(HttpStatusCode.OK, docsNominacion);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/documento/ListarDocumentosDestino")]
        public HttpResponseMessage ListarDocumentosDestino(int destinoId = 0)
        {
            try
            {
                var docsDestino = servicioDocumento.ListarDocumentosDestino(destinoId);
                return Request.CreateResponse(HttpStatusCode.OK, docsDestino);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/documento/ListarDocumentosPorConfiguracion")]
        public HttpResponseMessage ListarDocumentosPorConfiguracion(int configuracionId)
        {
            try
            {
                var docsDestino = servicioDocumento.ListarDocumentosPorConfiguracion(configuracionId);
                return Request.CreateResponse(HttpStatusCode.OK, docsDestino);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/documento/ListarDocumentosProducto")]
        public HttpResponseMessage ListarDocumentosProducto(int productoId = 0)
        {
            try
            {
                var docsProducto = servicioDocumento.ListarDocumentosProducto(productoId);
                return Request.CreateResponse(HttpStatusCode.OK, docsProducto);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }
        [HttpGet]
        [Route("api/documento/ListarNominacionDocumentoEstadoPorEmbarque")]
        public HttpResponseMessage ListarNominacionDocumentoEstadoPorEmbarque(int nominacionId, int configuracionDocumentoId, string documento = null, string documentoEstado = null)
        {
            try
            {
                List<string> listDocumento = null;
                List<string> listDocumentoEstado = null;
                listDocumento = (!string.IsNullOrEmpty(documento) ? documento.Split(',').ToList() : null);
                listDocumentoEstado = (!string.IsNullOrEmpty(documentoEstado) ? documentoEstado.Split(',').ToList() : null);
                var resultado = servicioDocumento.ListarNominacionDocumentoEstadoPorEmbarque(nominacionId, configuracionDocumentoId, listDocumento, listDocumentoEstado);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }
        [HttpGet]
        [Route("api/documento/ObtenerNominacionDocumentoEmbarque")]
        public HttpResponseMessage ObtenerNominacionDocumentoEmbarque(int nominacionId, int embarqueId)
        {
            try
            {
                var resultado = servicioDocumento.ObtenerNominacionDocumentoEmbarque(nominacionId, embarqueId);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/documento/ObtenerNominacionDocumento")]
        public HttpResponseMessage ObtenerNominacionDocumento(int id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioDocumento.ObtenerNominacionDocumento(id));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/documento/GuardarArchivos")]
        public HttpResponseMessage GuardarArchivos(int nomDocId)
        {
            try
            {
                // Es necesario encapsular los archivos en una lista ya que la clase HttpFileCollection no se puede pasar entre capas
                var archivos = HttpContext.Current.Request.Files;
                var listaArchivos = new List<ArchivoDto>();

                for (int i = 0; i < archivos.Count; i++)
                {
                    var archivo = archivos[i];

                    if (archivo != null && archivo.ContentLength > 0)
                    {
                        var archivoDto = new ArchivoDto(archivo);
                        listaArchivos.Add(archivoDto);
                    }
                }

                var res = comandos.Ejecutar(new SubirArchivoDocumento { NominacionDocumentoId = nomDocId, Archivos = listaArchivos, Usuario = this.nombreUsuario });
                if (res.HayErrores)
                {
                    throw new Exception(res.Errores[""]);
                }

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/documento/DescargarArchivo")]
        public HttpResponseMessage ObtenerArchivo(int id)
        {
            try
            {
                var archivo = servicioDocumento.ObtenerArchivo(id);
                var response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new ByteArrayContent(archivo.Contenido);
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(archivo.TipoContenido);
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") { FileName = archivo.Nombre };
                return response;
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpDelete]
        [Route("api/documento/EliminarArchivo")]
        public HttpResponseMessage EliminarArchivo(int id)
        {
            try
            {
                servicioDocumento.EliminarArchivo(id, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPut]
        [Route("api/documento/ActualizarEstado")]
        public HttpResponseMessage ActualizarEstado(ActualizarNominacionDocumentoEstadoDto dto)
        {
            try
            {
                servicioDocumento.ActualizarEstado(dto.NominacionDocumentoId, dto.EstadoId, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/documento/CrearComentario")]
        public HttpResponseMessage CrearComentario(CrearComentarioDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(this.nombreUsuario))
                {
                    throw new Exception("No se ha podido identificar el usuario, por favor cierre la ventana y vuelva a ingresar");
                }
                servicioDocumento.CrearComentario(dto.NominacionDocumentoId, dto.Comentario, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }
        
        [HttpGet]
        [Route("api/documento/ListarProductosPorNominacion")]
        public HttpResponseMessage ListarProductosPorNominacion(int nominacionId)
        {
            try
            {
                var resultado = servicioDocumento.ListarProductosPorNominacion(nominacionId);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }
		
       
        [HttpGet]
        [Route("api/documento/ListarConfiguracionDocumentoPorNominacion")]
        public HttpResponseMessage ListarConfiguracionDocumentoPorNominacion(int nominacionId)
        {
            try
            {
                var resultado = servicioDocumento.ListarConfiguracionDocumentoPorNominacion(nominacionId);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }
        [HttpGet]
        [Route("api/documento/ListarDestinoPorNominacion")]
        public HttpResponseMessage ListarDestinoPorNominacion(int nominacionId)
        {
            try
            {
                var resultado = servicioDocumento.ListarDestinoPorNominacion(nominacionId);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }
        [HttpGet]
        [Route("api/documento/ListarDocumentosPorNominacion")]
        public HttpResponseMessage ListarDocumentosPorNominacion(int nominacionId)
        {
            try
            {
                var resultado = servicioDocumento.ListarDocumentosPorNominacion(nominacionId);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }		        
        
    }
}