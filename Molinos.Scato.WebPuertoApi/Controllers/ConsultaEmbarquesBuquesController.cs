using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class ConsultaEmbarquesBuquesController : BaseController
    {
        public ConsultaEmbarquesBuquesController(IServicioRepositorio servicio) : base(servicio)
        {
        }

        [HttpGet]
        [Autorizacion(PermisosScato.EmbarquesPorBuques_Ver, PermisosScato.Embarques_Ver, PermisosScato.LineUp_Ver)]
        [Route("api/ConsultaEmbarquesBuques/Listar")]
        public HttpResponseMessage Listar([FromUri] CargaFiltroDto filtro, int pagina = 1, string ordenarPor = "Fecha", DirOrden dirOrden = DirOrden.Desc, int itemsPorPagina = 10)
        {
            var paginacion = new Paginacion(ordenarPor, dirOrden, pagina, itemsPorPagina);
            var resultado = servicio.ListarEmbarquePorBuques(filtro ?? new CargaFiltroDto(), paginacion);
            return Request.CreateResponse(HttpStatusCode.OK, resultado);
        }

        [HttpGet]
        [Autorizacion(PermisosScato.EmbarquesPorBuques_Ver, PermisosScato.Embarques_Ver, PermisosScato.LineUp_Ver)]
        [Route("api/ConsultaEmbarquesBuques/ListarVapores")]
        public HttpResponseMessage ListarVapores()
        {
            var resultado = servicio.ListarVapores(new Paginacion("Nombre", DirOrden.Asc, 1, 1000), null);
            return Request.CreateResponse(HttpStatusCode.OK, resultado.Items);
        }

        [HttpGet]
        [Autorizacion(PermisosScato.EmbarquesPorBuques_Ver, PermisosScato.Embarques_Ver, PermisosScato.LineUp_Ver)]
        [Route("api/ConsultaEmbarquesBuques/ListarExportadores")]
        public HttpResponseMessage ListarExportadores()
        {
            return Request.CreateResponse(HttpStatusCode.OK, servicio.ListaExportadores());
        }

        [HttpGet]
        [Autorizacion(PermisosScato.EmbarquesPorBuques_Ver, PermisosScato.Embarques_Ver, PermisosScato.LineUp_Ver)]
        [Route("api/ConsultaEmbarquesBuques/ListarDestinos")]
        public HttpResponseMessage ListarDestinos()
        {
            return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarTodosDestinos());
        }

        [HttpGet]
        [Autorizacion(PermisosScato.EmbarquesPorBuques_Ver, PermisosScato.Embarques_Ver, PermisosScato.LineUp_Ver)]
        [Route("api/ConsultaEmbarquesBuques/ListarMateriales")]
        public HttpResponseMessage ListarMateriales()
        {
            return Request.CreateResponse(HttpStatusCode.OK, servicio.ListaMaterialesPuerto());
        }
    }
}
