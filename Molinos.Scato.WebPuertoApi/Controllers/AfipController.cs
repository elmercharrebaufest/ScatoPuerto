using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Enumeradores;
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

        #region Tablas de referencia

        [HttpGet]
        [Route("api/afip/ListarTiposEmbalaje")]
        public HttpResponseMessage ListarTiposEmbalaje()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarTiposEmbalaje());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarPuntosAduaneros")]
        public HttpResponseMessage ListarPuntosAduaneros()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarPuntosAduaneros());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarPuertos")]
        public HttpResponseMessage ListarPuertos()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarPuertos());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarPaises")]
        public HttpResponseMessage ListarPaises()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarPaises());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarTiposDocumento")]
        public HttpResponseMessage ListarTiposDocumento()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarTiposDocumento());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarNaturalezasEmbalaje")]
        public HttpResponseMessage ListarNaturalezasEmbalaje()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarNaturalezasEmbalaje());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarLugaresOperativos")]
        public HttpResponseMessage ListarLugaresOperativos()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarLugaresOperativos());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarCondicionesContenedor")]
        public HttpResponseMessage ListarCondicionesContenedor()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarCondicionesContenedor());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }


        #endregion

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

        [HttpPut]
        [Route("api/afip/RectificarCaratula")]
        public HttpResponseMessage RectificarCaratula(AfipCaratulaDto caratula)
        {
            try
            {
                var resultado = servicioAfip.RectificarCaratula(caratula);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpDelete]
        [Route("api/afip/AnularCaratula")]
        public HttpResponseMessage AnularCaratula(int id)
        {
            try
            {
                var resultado = servicioAfip.AnularCaratula(id);
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
                Type estadosType = typeof(EstadosCaratulaAFIP);
                var estados = estadosType.GetFields().Select(f => (string)f.GetValue(null)).ToList();
                return Request.CreateResponse(HttpStatusCode.OK, estados);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPut]
        [Route("api/afip/CambiarEstadoCaratula")]
        public HttpResponseMessage CambiarEstadoCaratula(int id, string estado)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.CambiarEstadoCaratula(id, estado));
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
                var resultado = servicioAfip.RegistrarCoem(coem);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPut]
        [Route("api/afip/RectificarCoem")]
        public HttpResponseMessage RectificarCoem(AfipCoemDto coem)
        {
            try
            {
                var resultado = servicioAfip.RectificarCoem(coem);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);                
            }
        }

        [HttpDelete]
        [Route("api/afip/AnularCoem")]
        public HttpResponseMessage AnularCoem(int id, int idEstado)
        {
            try
            {
                var resultado = servicioAfip.AnularCoem(id, idEstado);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);               
            }            
        }

        [HttpPut]
        [Route("api/afip/CerrarCoem")]
        public HttpResponseMessage CerrarCoem(int id, int idEstado)
        {
            try
            {
                var resultado = servicioAfip.CerrarCoem(id, idEstado);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);                
            }
        }

        [HttpPut]
        [Route("api/afip/SolicitarAnulacionCoem")]
        public HttpResponseMessage SolicitarAnulacionCoem(int id)
        {
            try
            {
                var resultado = servicioAfip.SolicitarAnulacionCoem(id);
                return Request.CreateResponse(HttpStatusCode.OK, resultado);
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

        [HttpPut]
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

        //[HttpPut]
        //[Route("api/afip/AnularCoem")]
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