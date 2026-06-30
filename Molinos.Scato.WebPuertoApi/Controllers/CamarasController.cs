using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class CamarasController : BaseController
    {
        public CamarasController(IServicioRepositorio servicio)
            : base(servicio)
        {
        }

        [HttpGet]
        [Route("api/Camaras/Listar")]
        public HttpResponseMessage Listar()
        {

            try
            {
                var camaras = servicio.ListarCamarasAduana();
                return Request.CreateResponse(HttpStatusCode.OK, camaras);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(
                    HttpStatusCode.InternalServerError,
                    ex);
            }
            //var camaras = servicio.ListarCamarasAduana();
            //return Request.CreateResponse(HttpStatusCode.OK, camaras);
        }
    }
}
