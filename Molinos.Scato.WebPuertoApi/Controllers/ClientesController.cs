using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Servicios.Impl;
using Molinos.Scato.Servicios;
using Ninject.Activation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net;
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

    }
}