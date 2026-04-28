using Molinos.Scato.Servicios;
using Molinos.Scato.Dominio.Dto;
using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Molinos.Scato.WebPuertoApi.Helper;
using Molinos.Scato.Dominio.Comandos;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class CargaOtrosMuellesController : BaseController
    {
        private readonly IServicioComandos comandos;

        public CargaOtrosMuellesController(IServicioRepositorio servicio, IServicioCargaOtrosMuelles servicioCargaOtrosMuelles, IServicioComandos comandos) : base(servicio, servicioCargaOtrosMuelles: servicioCargaOtrosMuelles)
        {
            this.comandos = comandos;
        }

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
        public HttpResponseMessage GuardarCarga(OtroMuelleCargaDto otroMuelleCarga, int embarqueId, bool zarpar)
        {
            try
            {
                servicioCargaOtrosMuelles.GuardarCarga(otroMuelleCarga, embarqueId, zarpar, this.nombreUsuario);
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

        [HttpGet]
        [Route("api/CargaOtrosMuelles/ObtenerMailFinalizacion")]
        public HttpResponseMessage ObtenerMailFinalizacion(int embarqueId)
        {
            try
            {
                var destinatarios = servicioCargaOtrosMuelles.ObtenerDestinatarios();
                var embarque = servicioCargaOtrosMuelles.ObtenerEmbarque(embarqueId);
                var mail = NotificacionFinalizacionOtrosMuelles.GenerarMail(embarque, destinatarios);
                return Request.CreateResponse(HttpStatusCode.OK, mail);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/CargaOtrosMuelles/ObtenerEmbarque")]
        public HttpResponseMessage ObtenerEmbarque(int embarqueId)
        {
            try
            {
                var embarque = servicioCargaOtrosMuelles.ObtenerEmbarque(embarqueId);
                return Request.CreateResponse(HttpStatusCode.OK, embarque);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/CargaOtrosMuelles/EnviarMailFinalizacion")]
        public HttpResponseMessage EnviarMailFinalizacion(MailDto mail)
        {
            try
            {
                var res = comandos.Ejecutar(new EnvioMail
                {
                    Cuerpo = mail.Body.Replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;")
                           .Replace("\f\f", "</b>").Replace("\f", "<b>").Replace("\0\0", "</u>").Replace("\0", "<u>"),
                    Destinatarios = mail.Destinatarios,
                    Titulo = mail.Titulo,
                    Copia = mail.Copia,
                    AttachmentName = null,
                });

                if (res.HayErrores)
                {
                    throw new Exception(res.Errores[""]);
                }

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }
    }
}