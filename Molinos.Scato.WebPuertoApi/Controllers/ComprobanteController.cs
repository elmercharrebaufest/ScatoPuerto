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
    }
}