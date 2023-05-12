using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
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
        private readonly IServicioAfip servicioAfip;
        private readonly IServicioComandos comandos;
        public AfipController(IServicioRepositorio servicio, IServicioAfip servicioAfip, IServicioComandos comandos) : base(servicio)
        {
            this.servicioAfip = servicioAfip;
            this.comandos = comandos;
        }

        #region Caratula

        [HttpGet]
        [Route("api/afip/ListarCaratulas")]
        public HttpResponseMessage ListarCaratulas()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarCaratulas());
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
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ObtenerCaratula(id));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/afip/RegistrarCaratula")]
        public HttpResponseMessage RegistrarCaratula(AfipCaratulaDto caratula)
        {
            try
            {
                var resultado = comandos.Ejecutar(new AfipRegistrarCaratula { Dto = caratula });
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/afip/AnularCaratula")]
        public HttpResponseMessage AnularCaratula(string id)
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