using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Conversiones;
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

        [HttpGet]
        [Route("api/afip/ListarMotivosSolicitudCambio")]
        public HttpResponseMessage ListarMotivosSolicitudCambio()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarMotivosSolicitudCambio());
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
        public HttpResponseMessage ListarCaratulas(int? pagina = null, int? itemsPorPagina = null, DateTime? fechaArribo = null, string buque = null, string identificador = null, string estado = null)
        {
            try
            {
                var paginacion = new Paginacion(null, DirOrden.Desc, (pagina == null) ? 0 : pagina.Value, (itemsPorPagina == 0 || !itemsPorPagina.HasValue) ? 10 : itemsPorPagina.Value);
                var response = servicioAfip.ListarCaratulas(paginacion, fechaArribo, buque, identificador, estado);
                return Request.CreateResponse(HttpStatusCode.OK, response);
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
        public HttpResponseMessage RegistrarCaratula(AfipRegistrarCaratulaDto caratula)
        {
            if (!ModelState.IsValid)
            {
                var errores = string.Join("\n", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).Distinct());
                return Request.CreateResponse(HttpStatusCode.BadRequest, errores);
            }
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
        public HttpResponseMessage RectificarCaratula(AfipRectificarCaratulaDto caratula)
        {
            if (!ModelState.IsValid)
            {
                var errores = string.Join("\n", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).Distinct());
                return Request.CreateResponse(HttpStatusCode.BadRequest, errores);
            }
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
        public HttpResponseMessage ListarCoems(int? idCaratula = null, int? pagina = null, int? itemsPorPagina = null, string identificador = null, string declaracion = null, string estado = null)
        {
            try
            {
                var paginacion = new Paginacion(null, DirOrden.Desc, (pagina == null) ? 0 : pagina.Value, (itemsPorPagina == 0 || !itemsPorPagina.HasValue) ? 10 : itemsPorPagina.Value);
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarCoems(idCaratula, paginacion, identificador, declaracion, estado));
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

        [HttpPost]
        [Route("api/afip/RegistrarCoem")]
        public HttpResponseMessage RegistrarCoem(AfipCoemRegistrarRequest coem)
        {
            if (ModelState.IsValid)
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
            else
            {
                // El modelo no es válido, devuelve los errores de validación
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

        [HttpPut]
        [Route("api/afip/RectificarCoem")]
        public HttpResponseMessage RectificarCoem(AfipCoemDto coem)
        {
            if (ModelState.IsValid)
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
            else
            {
                // El modelo no es válido, devuelve los errores de validación
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
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

        #region Solicitudes

        [HttpPost]
        [Route("api/afip/SolicitarCierreCargaGranel")]
        public HttpResponseMessage SolicitarCierreCargaGranel(AfipSolicitarCierreCargaGranelDto solicitarCargaGranelDto)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var resultado = servicioAfip.SolicitarCierreCargaGranel(solicitarCargaGranelDto);
                    return Request.CreateResponse(HttpStatusCode.OK, resultado);
                }
                catch (Exception e)
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
                }
            }
            else
            {
                // El modelo no es válido, devuelve los errores de validación
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

        [HttpPost]
        [Route("api/afip/SolicitarNoAbordo")]
        public HttpResponseMessage SolicitarNoAbordo(AfipSolicitarNoAbordoDto solicitarNoAbordoDto)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var resultado = servicioAfip.SolicitarNoAbordo(solicitarNoAbordoDto);
                    return Request.CreateResponse(HttpStatusCode.OK, resultado);
                }
                catch (Exception e)
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
                }
            }
            else
            {
                // El modelo no es válido, devuelve los errores de validación
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarMotivosNoABordo")]
        public HttpResponseMessage ListarMotivosNoABordo()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarMotivosNoAbordo());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }


        #region Solicitar Cambio de Buque
        [HttpPut]
        [Route("api/afip/SolicitarCambioBuque")]
        public HttpResponseMessage SolicitarCambioBuque(AfipSolicitarCambioBuqueDto solicitarCambioBuqueDto)
        {
            try
            {
                servicioAfip.SolicitarCambioBuque(solicitarCambioBuqueDto);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarSolicitudesCambioBuque")]
        public HttpResponseMessage ListarSolicitudesCambioBuque()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarSolicitudesCambioBuque());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarSolicitudesCambioBuque/{id}")]
        public HttpResponseMessage ListarSolicitudesCambioBuque(int id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarSolicitudesCambioBuque(id));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPut]
        [Route("api/afip/EfectuarSolicitudCambioBuque/{id}")]
        public HttpResponseMessage EfectuarSolicitudCambioBuque(int id)
        {
            try
            {
                servicioAfip.EfectuarSolicitudCambioBuque(id);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPut]
        [Route("api/afip/RechazarSolicitudCambioBuque/{id}")]
        public HttpResponseMessage RechazarSolicitudCambioBuque(int id)
        {
            try
            {
                servicioAfip.RechazarSolicitudCambioBuque(id);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }
        #endregion

        #region Solicitar Cambio de Fechas
        [HttpPut]
        [Route("api/afip/SolicitarCambioFechas")]
        public HttpResponseMessage SolicitarCambioFechas(AfipSolicitarCambioFechasDto solicitarCambioFechasDto)
        {
            try
            {
                servicioAfip.SolicitarCambioFechas(solicitarCambioFechasDto);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarSolicitudesCambioFechas")]
        public HttpResponseMessage ListarSolicitudesCambioFechas()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarSolicitudesCambioFechas());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/afip/ListarSolicitudesCambioFechas/{id}")]
        public HttpResponseMessage ListarSolicitudesCambioFechas(int id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioAfip.ListarSolicitudesCambioFechas(id));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPut]
        [Route("api/afip/EfectuarSolicitudCambioFechas/{id}")]
        public HttpResponseMessage EfectuarSolicitudCambioFechas(int id)
        {
            try
            {
                servicioAfip.EfectuarSolicitudCambioFechas(id);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPut]
        [Route("api/afip/RechazarSolicitudCambioFechas/{id}")]
        public HttpResponseMessage RechazarSolicitudCambioFechas(int id)
        {
            try
            {
                servicioAfip.RechazarSolicitudCambioFechas(id);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }
        #endregion

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