using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Administracion;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using Molinos.Scato.WebPuertoApi.EXCEL;
using Molinos.Scato.WebPuertoApi.Helper;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
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
        [Route("api/administracion/ListarConceptos")]
        public HttpResponseMessage ListarConceptos()
        {
            try
            {
                var response = servicioAdministracion.ListarConceptos();
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

        [HttpGet]
        [Route("api/administracion/ListarMuelles")]
        public HttpResponseMessage ListarMuelles()
        {
            try
            {
                var response = servicio.ListarMuelles();
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ListarEmbarquesATarifar")]
        public HttpResponseMessage ListarEmbarquesATarifar(DateTime periodo, int muelleId)
        {
            try
            {
                var response = servicioAdministracion.ListarEmbarquesATarifar(periodo, muelleId);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ObtenerTarifaEmbarque")]
        public HttpResponseMessage ObtenerTarifaEmbarque(int embarqueId, int productoId, int exportadorId, DateTime periodo)
        {
            try
            {
                var response = servicioAdministracion.ObtenerTarifaEmbarque(embarqueId, productoId, exportadorId, periodo);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/administracion/GuardarTarifaPorEmbarque")]
        public HttpResponseMessage GuardarTarifaPorEmbarque(TarifaPorEmbarqueDto dto)
        {
            try
            {
                comandos.Ejecutar(new GuardarTarifaPorEmbarque { Dto = dto, Usuario = base.nombreUsuario });
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ListarTipoContratoTarifa")]
        public HttpResponseMessage ListarTipoContratoTarifa()
        {
            try
            {
                var response = servicioAdministracion.ListarTipoContratoTarifa();
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ListarCombosProvisiones")]
        public HttpResponseMessage ListarCombosProvisiones()
        {
            try
            {
                var response = servicioAdministracion.ObtenerCombosProvisiones();
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ObtenerProvision")]
        public HttpResponseMessage ObtenerProvision(int? muelleId, DateTime periodo, int? embarqueId, int? productoId, int? exportadorId, int? contratoId)
        {
            try
            {
                var response = servicioAdministracion.ObtenerProvision(muelleId, periodo, embarqueId, productoId, exportadorId, contratoId);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/administracion/GuardarProvision")]
        public HttpResponseMessage GuardarProvision(AltaProvisionYGastoDto dto)
        {
            try
            {
                comandos.Ejecutar(new GuardarProvision { Dto = dto, Usuario = base.nombreUsuario });
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/administracion/ConfirmarProvisiones")]
        public HttpResponseMessage ConfirmarProvisiones(List<int> idsTarifas)
        {
            try
            {
                comandos.Ejecutar(new ConfirmarProvisiones { IdsTarifas = idsTarifas, Usuario = base.nombreUsuario });
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/administracion/ExportarProvisiones")]
        public HttpResponseMessage ExportarProvisiones(
        List<int> idsTarifas)
        {
            try
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                var tarifas = servicioAdministracion.ListarTarifasIds(idsTarifas);
                var provisiones = servicioAdministracion.ListarProvisionesDadaTarifasIds(idsTarifas);
                var conceptos = servicioAdministracion.ListarConceptos();
                var excel = new ExcelProvisionesGastos(provisiones, tarifas, conceptos).GenerarExcel();
                response.Content = new ByteArrayContent(excel);
                response.Content.Headers.ContentLength = excel.LongLength;
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                response.Content.Headers.ContentDisposition.FileName = "listado_provisiones" + ".xlsx";
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping("listado_embarques"));
                return response;
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        #region Acuerdos

        [HttpGet]
        [Route("api/administracion/ObtenerCombosAcuerdos")]
        public HttpResponseMessage ObtenerCombosAcuerdos()
        {
            try
            {
                var response = servicioAdministracion.ObtenerCombosAcuerdos();
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ListarAcuerdos")]
        public HttpResponseMessage ListarAcuerdos()
        {
            try
            {
                var response = servicioAdministracion.ListarAcuerdos();
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ObtenerAcuerdo")]
        public HttpResponseMessage ObtenerAcuerdo(int acuerdoId)
        {
            try
            {
                var response = servicioAdministracion.ObtenerAcuerdo(acuerdoId);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/administracion/ObtenerArchivoAcuerdo")]
        public HttpResponseMessage ObtenerArchivoAcuerdo(int acuerdoId)
        {
            try
            {
                var archivo = servicioAdministracion.ObtenerArchivoAcuerdo(acuerdoId);
                var response = Request.CreateResponse(HttpStatusCode.OK);
                response.Content = new ByteArrayContent(archivo.Contenido);
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(archivo.TipoContenido);
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") { FileName = archivo.Nombre };
                return response;
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/administracion/GuardarAcuerdo")]
        public HttpResponseMessage GuardarAcuerdo()
        {
            try
            {
                var acuerdoJson = HttpContext.Current.Request.Form["acuerdo"];
                var acuerdo = JsonConvert.DeserializeObject<AcuerdoDto>(acuerdoJson);

                ArchivoDto archivoDto = null;
                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    var archivo = HttpContext.Current.Request.Files[0];
                    if (archivo != null && archivo.ContentLength > 0)
                    {
                        archivoDto = new ArchivoDto(archivo);
                    }
                }

                var eliminarArchivoStr = HttpContext.Current.Request.Form["eliminarArchivo"];
                var eliminarArchivo = false;
                if (!string.IsNullOrEmpty(eliminarArchivoStr))
                {
                    bool.TryParse(eliminarArchivoStr, out eliminarArchivo);
                }

                var resultado = comandos.Ejecutar(new GuardarAcuerdo { Acuerdo = acuerdo, Usuario = base.nombreUsuario, Archivo = archivoDto, EliminarArchivo = eliminarArchivo });
                if (resultado.HayErrores)
                {
                    throw new Exception(resultado.Errores[""]);
                }
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpDelete]
        [Route("api/administracion/EliminarAcuerdo")]
        public HttpResponseMessage EliminarAcuerdo(int acuerdoId)
        {
            try
            {
                this.servicioAdministracion.EliminarAcuerdo(acuerdoId, base.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/administracion/EnviarMailAcuerdo")]
        public HttpResponseMessage EnviarMailAcuerdo(MailDto mail)
        {
            try
            {
                var response = comandos.Ejecutar(new EnvioMail
                {
                    Titulo = mail.Titulo,
                    Destinatarios = mail.Destinatarios,
                    Copia = mail.Copia,
                    Cuerpo = mail.Body
                });

                if (response.HayErrores)
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, response.Errores[""]);
                }

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

		[HttpPost]
		[Route("api/administracion/ListarAcuerdosPorEmbarcacion")]
		public HttpResponseMessage ListarAcuerdosPorEmbarcacion(int idEmbarcacion, FiltrosAcuerdosPorEmbarcacionDto filtros)
		{
			try
			{
				// Crear objeto de paginación
				var paginacion = new Paginacion(null, DirOrden.Asc, filtros.Pagina, filtros.ItemsPorPagina == 0 ? 10 : filtros.ItemsPorPagina);

				// Llamar al servicio con los filtros y la paginación
				var listaPaginada = servicioAdministracion.ListarAcuerdosPorEmbarcacion(idEmbarcacion, paginacion, filtros);

				// Crear la respuesta
				var response = new { listaPaginada.Items, listaPaginada.ItemsTotales };
				return Request.CreateResponse(HttpStatusCode.OK, response);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpGet]
		[Route("api/administracion/ListarAcuerdosVinculados")]
		public HttpResponseMessage ListarAcuerdosVinculados(int idEmbarcacion)
		{
			try
			{
				var response = servicioAdministracion.ListarAcuerdosVinculadosAlEmbarque(idEmbarcacion);
				return Request.CreateResponse(HttpStatusCode.OK, response);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		#endregion
	}
}