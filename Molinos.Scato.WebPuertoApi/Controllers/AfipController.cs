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

        [HttpGet]
        [Route("api/afip/ComboCaratulas")]
        public HttpResponseMessage ComboCaratulas()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ComboCaratulas());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        #endregion

        #region COEMs

        [HttpGet]
        [Route("api/afip/ListarCoems")]
        public HttpResponseMessage ListarCoems()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarCoems());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ObtenerCoem")]
        public HttpResponseMessage ObtenerCoem(int id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ObtenerCoem(id));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarCoemsPorCaratula")]
        public HttpResponseMessage ListarCoemsPorCaratula(int idCaratula)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarCoemsPorCaratula(idCaratula));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/afip/RegistrarCoem")]
        public HttpResponseMessage RegistrarCoem(AfipCoemDto coem)
        {
            try
            {
                servicioAfip.RegistrarCoem(coem);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarEstadosCoem")]
        public HttpResponseMessage ListarEstadosCoem()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarEstadosCoem());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/afip/CambiarEstadoCoem")]
        public HttpResponseMessage CambiarEstadoCoem(int idCoem, int idEstado)
        {
            try
            {
                servicioAfip.CambiarEstadoCoem(idCoem, idEstado);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }
        #endregion

        #region CODE
        [HttpGet]
        [Route("api/afip/ListarCode")]
        public HttpResponseMessage ListarCode()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarCode());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ObtenerCode")]
        public HttpResponseMessage ObtenerCode(int id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ObtenerCode(id));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/afip/RegistrarCode")]
        public HttpResponseMessage RegistrarCode(AfipCodeDto code)
        {
            try
            {
                servicioAfip.RegistrarCode(code);
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