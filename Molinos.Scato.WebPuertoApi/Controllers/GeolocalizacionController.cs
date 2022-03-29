using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class GeolocalizacionController : BaseController
    {
        public GeolocalizacionController(IServicioRepositorio servicio) : base(servicio)
        {
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Geolocalizacion/ListarPuntosInteresGeolocalizacion")]
        public HttpResponseMessage ListarPuntosInteresGeolocalizacion(short estado)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarPuntosInteresGeolocalizacion(estado));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }

    }
}