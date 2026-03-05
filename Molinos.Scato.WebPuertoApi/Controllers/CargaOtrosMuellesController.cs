using Molinos.Scato.Servicios;
using Molinos.Scato.Dominio.Dto;
using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class CargaOtrosMuellesController : BaseController
    {
        public CargaOtrosMuellesController(IServicioRepositorio servicio, IServicioCargaOtrosMuelles servicioCargaOtrosMuelles) : base(servicio, servicioCargaOtrosMuelles: servicioCargaOtrosMuelles) { }

        [HttpGet]
        [Route("api/CargaOtrosMuelles/ObtenerCargaPorEmbarque")]
        public HttpResponseMessage ObtenerCargaPorEmbarque(int embarqueId)
        {
            try
            {
                var carga = servicioCargaOtrosMuelles.ObtenerCarga(embarqueId);
                return Request.CreateResponse(HttpStatusCode.OK, carga);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/CargaOtrosMuelles/ObtenerDatosNominacion")]
        public HttpResponseMessage ObtenerDatosNominacion(int embarqueId)
        {
            try
            {
                var datosNominacion = servicioCargaOtrosMuelles.ObtenerDatosNominacion(embarqueId);
                return Request.CreateResponse(HttpStatusCode.OK, datosNominacion);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/CargaOtrosMuelles/GuardarCarga")]
        public HttpResponseMessage GuardarCarga(OtroMuelleCargaDto otroMuelleCarga, int embarqueId)
        {
            try
            {
                servicioCargaOtrosMuelles.GuardarCarga(otroMuelleCarga, embarqueId, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/CargaOtrosMuelles/GuardarDetalleCarga")]
        public HttpResponseMessage GuardarDetalleCarga(OtroMuelleCargaDetalleDto otroMuelleCargaDetalle, int embarqueId)
        {
            try
            {
                servicioCargaOtrosMuelles.GuardarDetalleCarga(otroMuelleCargaDetalle, embarqueId, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpDelete]
        [Route("api/CargaOtrosMuelles/EliminarDetalleCarga")]
        public HttpResponseMessage EliminarDetalleCarga(int otroMuelleCargaDetalleId)
        {
            try
            {
                servicioCargaOtrosMuelles.EliminarDetalleCarga(otroMuelleCargaDetalleId, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/CargaOtrosMuelles/ValidarHorarios")]
        public HttpResponseMessage ValidarHorarios(OtroMuelleCargaDetalleDto detalle, int embarqueId)
        {
            try
            {
                var esValido = servicioCargaOtrosMuelles.ValidarHorarios(detalle, embarqueId);
                return Request.CreateResponse(HttpStatusCode.OK, esValido);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }
    }
}