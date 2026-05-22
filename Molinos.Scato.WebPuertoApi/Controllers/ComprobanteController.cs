using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Impl;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class ComprobanteController : BaseController
    {
        private readonly IServicioComandos comandos;
        public ComprobanteController(IServicioRepositorio servicio, IServicioComandos comandos, IServicioComprobante servicioComprobante) : base(servicio, servicioComprobante: servicioComprobante)
        {
            this.comandos = comandos;
        }

        [HttpGet]
        [Route("api/comprobante/ObtenerNumeroInicioComprobante")]
        public HttpResponseMessage ObtenerNumeroInicioComprobante()
        {
            try
            {
                var numeroInicio = servicioComprobante.ObtenerNumeroInicioComprobante();
                return Request.CreateResponse(HttpStatusCode.OK, numeroInicio);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/comprobante/GuardarNumeroInicioComprobante")]
        public HttpResponseMessage GuardarNumeroInicioComprobante(string numero)
        {
            try
            {
                servicioComprobante.GuardarNumeroInicioComprobante(numero, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/comprobante/ListarComprobantes")]
        public HttpResponseMessage ListarComprobantes(int moduloDeCargaId)
        {
            try
            {
                var resultado = servicioComprobante.ListarComprobantes(moduloDeCargaId);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/comprobante/GenerarRomaneo")]
        public HttpResponseMessage GenerarRomaneo(int moduloDeCargaId, DateTime? fecha = null, int? turno = null)
        {
            try
            {
                var resultado = servicioComprobante.GenerarRomaneo(moduloDeCargaId, this.nombreUsuario, fecha, turno);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/comprobante/GenerarSecuenciaRealCarga")]
        public HttpResponseMessage GenerarSecuenciaRealCarga(int moduloDeCargaId)
        {
            try
            {
                var resultado = servicioComprobante.GenerarSecuenciaRealCarga(moduloDeCargaId, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/comprobante/ObtenerComprobante")]
        public HttpResponseMessage ObtenerComprobante(int comprobanteId)
        {
            try
            {
                var resultado = servicioComprobante.ObtenerComprobante(comprobanteId);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPut]
        [Route("api/comprobante/GuardarFechaImpresionComprobante")]
        public HttpResponseMessage GuardarFechaImpresionRomaneo(int comprobanteId, string usuario, int npaginas)
        {
            try
            {
                string rutaArchivo = null;
                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    var archivoSubido = HttpContext.Current.Request.Files[0];
                    var archivo = new ArchivoDto(archivoSubido);
                    var resultado = (ResultadoCrear)comandos.Ejecutar(new GuardarComprobanteArchivo { ComprobanteId = comprobanteId, Archivo = archivo, Usuario = usuario, Npaginas = npaginas });
                }
                else
                {
                    servicioComprobante.GuardarFechaImpresionComprobante(comprobanteId, usuario);
                }
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpDelete]
        [Route("api/comprobante/AnularComprobante")]
        public HttpResponseMessage AnularRomaneo(int comprobanteId, string usuario)
        {
            try
            {
                servicioComprobante.AnularComprobante(comprobanteId, usuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/comprobante/ObtenerArchivoComprobante")]
        public HttpResponseMessage ObtenerArchivoComprobante(int comprobanteId)
        {
            try
            {
                var archivo = servicioComprobante.ObtenerArchivoComprobante(comprobanteId);
                var response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new ByteArrayContent(archivo.Contenido);
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(archivo.TipoContenido);
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") { FileName = archivo.Nombre };
                return response;
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/comprobante/ObtenerNombreArchivo")]
        public HttpResponseMessage ObtenerNombreArchivo(int comprobanteId)
        {
            try
            {
                var nombre = servicioComprobante.ObtenerNombreArchivo(comprobanteId);
                return Request.CreateResponse(HttpStatusCode.OK, nombre);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }
    }
}