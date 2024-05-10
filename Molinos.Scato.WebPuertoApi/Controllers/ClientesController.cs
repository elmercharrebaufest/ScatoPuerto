using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
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
    public class ClientesController : BaseController
    {
        public ClientesController(IServicioRepositorio servicio, IServicioClientes servicioClientes) : base(servicio, null, null, null, servicioClientes)
        {
        }

        [HttpGet]
        [Route("api/Clientes/ListarClientes")]
        public HttpResponseMessage ListarClientes(int? pagina = null, int? itemsPorPagina = null, string nombre = null)
        {
            try
            {
                var paginacion = new Paginacion(null, DirOrden.Desc, (pagina == null) ? 0 : pagina.Value, (itemsPorPagina == 0 || !itemsPorPagina.HasValue) ? 10 : itemsPorPagina.Value);
                var response = servicioClientes.ListarClientesPuerto(paginacion, nombre);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Clientes/GuardarCliente")]
        public HttpResponseMessage GuardarCliente(CoordinadorPuertoDto clienteDto)
        {
            try
            {
                string usuario = base.nombreUsuario;
                servicioClientes.GuardarCliente(clienteDto, usuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Clientes/ObtenerCliente")]
        public HttpResponseMessage ObtenerCliente(int id)
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicioClientes.ObtenerCliente(id));
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Clientes/DeshabilitarCliente")]
        public HttpResponseMessage DeshabilitarCliente(CoordinadorPuertoDto clienteDto)
        {
            try
            {
                string usuario = base.nombreUsuario;
                servicioClientes.DeshabilitarCliente(clienteDto, usuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Clientes/ExportarExcel")]
        public HttpResponseMessage ExportarExcel(string nombre)
        {
            try
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                var listado = servicioClientes.ListarClientes(nombre);
                var excel = new ExcelClientes(listado).GenerarExcel();
                response.Content = new ByteArrayContent(excel);
                response.Content.Headers.ContentLength = excel.LongLength;
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                response.Content.Headers.ContentDisposition.FileName = "listado_clientes" + ".xls";
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping("listado_clientes.xls"));
                return response;
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }
    }
}