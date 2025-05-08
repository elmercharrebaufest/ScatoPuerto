using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using Molinos.Scato.WebPuertoApi.EXCEL;
using Molinos.Scato.WebPuertoApi.Helper;
using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class AdministracionController : BaseController
    {
        private readonly IServicioComandos comandos;

        public AdministracionController(IServicioRepositorio servicio, IServicioComandos comandos, IServicioAdministracion servicioAdministracion) : base(servicio, servicioAdministracion: servicioAdministracion)
        {
            this.comandos = comandos;
        }

        [HttpGet]
        [Route("api/administracion/ListarCombos")]
        public HttpResponseMessage ListarCombos()
        {
            try
            {
                var response = servicioAdministracion.ObtenerCombos();
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/administracion/ListarEmbarquesAdministracion")]
        public HttpResponseMessage ListarEmbarquesAdministracion(
            FiltrosAdministracionDto filtros)
        {
            try
            {
                // Crear objeto de paginación
                var paginacion = new Paginacion(null, DirOrden.Asc, filtros.Pagina, filtros.ItemsPorPagina == 0 ? 10 : filtros.ItemsPorPagina);

                // Llamar al servicio con los filtros y la paginación
                var listaPaginada = servicioAdministracion.ListarEmbarquesAdministracion(paginacion, filtros);

                // Crear la respuesta
                var response = new { listaPaginada.Items, listaPaginada.ItemsTotales };
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/administracion/ExportarListado")]
        public HttpResponseMessage ExportarListado(
            FiltrosAdministracionDto filtros)
        {
            try
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                var lista = servicioAdministracion.ListarEmbarquesAdministracionSinPaginar(filtros);
                var excel = new ExcelEmbarquesAdministracion(lista).GenerarExcel();
                response.Content = new ByteArrayContent(excel);
                response.Content.Headers.ContentLength = excel.LongLength;
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                response.Content.Headers.ContentDisposition.FileName = "listado_embarques" + ".xls";
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping("listado_embarques"));
                return response;
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/administracion/ObtenerDetalle")]
        public HttpResponseMessage ObtenerDetalle(int idEmbarque)
        {
            try
            {
                var detalleEmb = this.servicioAdministracion.ObtenerDetalleEmbarque(idEmbarque);
                return Request.CreateResponse(HttpStatusCode.OK, detalleEmb);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/administracion/GuardarAdministracionEmbarque")]
        public HttpResponseMessage GuardarAdministracionEmbarque(int embarqueId, bool facturar, AdministracionEmbarqueDto dto)
        {
            try
            {
                comandos.Ejecutar(new GuardarAdministracionEmbarque { Dto = dto, EmbarqueId = embarqueId, Facturar = facturar, Usuario = base.nombreUsuario });
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ObtenerNotificaciones")]
        public HttpResponseMessage ObtenerNotificaciones()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, this.servicioAdministracion.ObtenerNotificaciones());
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpDelete]
        [Route("api/administracion/EliminarNotificacion")]
        public HttpResponseMessage EliminarNotificacion(int id)
        {
            try
            {
                this.servicioAdministracion.EliminarNotificacion(id, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ObtenerDatosMailAlerta")]
        public HttpResponseMessage ObtenerDatosMailAlerta(int embarqueId)
        {
            try
            {
                var detalle = servicioAdministracion.ObtenerDetalleEmbarque(embarqueId);               
                var notificacion = new NotificacionAlertaAdministracion(detalle);
                var administracionEnvioAlertaDto = servicioAdministracion.ObtenerDatosMailAlertaAdministracion();
                administracionEnvioAlertaDto.Comentario = notificacion.GenerarCuerpoEmail();
                administracionEnvioAlertaDto.Buque = detalle.Buque;
                return Request.CreateResponse(HttpStatusCode.OK, administracionEnvioAlertaDto);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/administracion/EnviarMailAlerta")]
        public HttpResponseMessage EnviarMailAlerta(AdministracionEnvioAlertaDto envio)
        {
            try
            {
                servicioAdministracion.EnviarCorreoAlertaAdministracion(envio);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ListarConceptosProducto")]
        public HttpResponseMessage ListarConceptosProducto()
        {
            try
            {
                var response = servicioAdministracion.ListarConceptosProducto();
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ListarConceptosEmbarque")]
        public HttpResponseMessage ListarConceptosEmbarque()
        {
            try
            {
                var response = servicioAdministracion.ListarConceptosEmbarque();
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ObtenerTarifaProducto")]
        public HttpResponseMessage ObtenerTarifaProducto(int productoId, DateTime periodo)
        {
            try
            {
                var response = servicioAdministracion.ObtenerTarifaProducto(productoId, periodo);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/administracion/GuardarTarifaPorProducto")]
        public HttpResponseMessage GuardarTarifaPorProducto(TarifaPorProductoDto dto)
        {
            try
            {
                comandos.Ejecutar(new GuardarTarifaPorProducto { Dto = dto, Usuario = base.nombreUsuario });
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }
    }
}