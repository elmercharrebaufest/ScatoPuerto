using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using Molinos.Scato.WebPuertoApi.EXCEL;
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

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/administracion/ListarEmbarquesAdministracion")]
        public HttpResponseMessage ListarEmbarquesAdministracion(
            int pagina = 1,
            int itemsPorPagina = 10,
            DateTime? desamarre = null,
            string buques = null,
            string muelles = null,
            string tanques = null,
            string exportadores = null,
            string clientes = null,
            string materiales = null,
            string estados = null
            )

        {
            try
            {
                // Crear objeto de paginación
                var paginacion = new Paginacion(null, DirOrden.Asc, pagina, itemsPorPagina == 0 ? 10 : itemsPorPagina);

                // Llamar al servicio con los filtros y la paginación
                var listaPaginada = servicioAdministracion.ListarEmbarquesAdministracion(paginacion, desamarre, buques, muelles, tanques, exportadores, clientes, materiales, estados);

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
        [Route("api/administracion/ExportarListado")]
        public HttpResponseMessage ExportarListado(
            DateTime? desamarre = null,
            string buques = null,
            string muelles = null,
            string tanques = null,
            string exportadores = null,
            string clientes = null,
            string materiales = null,
            string estados = null)
        {
            try
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                var lista = servicioAdministracion.ListarEmbarquesAdministracionSinPaginar(desamarre, buques, muelles, tanques, exportadores, clientes, materiales, estados);
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
    }
}