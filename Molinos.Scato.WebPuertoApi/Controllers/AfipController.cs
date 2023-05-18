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
        public AfipController(IServicioRepositorio servicio, IServicioAfip servicioAfip) : base(servicio, null, null, servicioAfip)
        {

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
        public HttpResponseMessage ObtenerCaratula(int id)
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
                var resultado = servicioAfip.RegistrarCaratula(caratula);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarEstadosCaratula")]
        public HttpResponseMessage ListarEstadosCaratula()
        {
            try
            {
                var resultado = servicioAfip.ListarEstadosCaratula();
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/afip/CambiarEstadoCaratula")]
        public HttpResponseMessage CambiarEstadoCaratula(int id, int idEstado)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.CambiarEstadoCaratula(id, idEstado));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        #endregion
    }

}