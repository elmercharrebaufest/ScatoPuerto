using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Servicios;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class AfipController : BaseController
    {
        public AfipController(IServicioRepositorio servicio) : base(servicio)
        {
        }

        #region Caratula

        [HttpGet]
        [Route("api/afip/ListarCaratulas")]
        public HttpResponseMessage ListarCaratulas()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ObtenerCaratula")]
        public HttpResponseMessage ObtenerCaratula(string id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/afip/RegistrarCaratula")]
        public HttpResponseMessage RegistrarCaratula(object caratula)
        {
            try
            {
                // TODO: hacer distincion entre Registrar y Rectificar según si tiene ID
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/afip/AnularCaratula")]
        public HttpResponseMessage AnularCaratula(int id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/afip/SolicitarCambioBuque")]
        public HttpResponseMessage SolicitarCambioBuque(object cambioBuque)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/afip/SoliciarCambioFechas")]
        public HttpResponseMessage SolicitarCambioFechas(object cambioFechas)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/afip/SolicitarCambioLOT")]
        public HttpResponseMessage SolicitarCambioLOT(object cambioLOT)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        #endregion
    }

}