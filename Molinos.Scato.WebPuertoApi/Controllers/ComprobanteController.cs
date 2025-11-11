using Molinos.Scato.Servicios;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class ComprobanteController : BaseController
    {
        public ComprobanteController(IServicioRepositorio servicio, IServicioComprobante servicioComprobante) : base(servicio, servicioComprobante: servicioComprobante) { }

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

        [HttpPost]
        [Route("api/comprobante/GenerarRomaneo")]
        public HttpResponseMessage GenerarRomaneo(int moduloDeCargaId)
        {
            try
            {
                var resultado = servicioComprobante.GenerarRomaneo(moduloDeCargaId, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/comprobante/ObtenerRomaneo")]
        public HttpResponseMessage ObtenerRomaneo(int romaneoId)
        {
            try
            {
                var resultado = servicioComprobante.ObtenerRomaneo(romaneoId);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
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

        [HttpPut]
        public HttpResponseMessage GuardarFechaImpresionRomaneo(int romaneoId)
        {
            try
            {
                servicioComprobante.GuardarFechaImpresionRomaneo(romaneoId, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }
    }
}