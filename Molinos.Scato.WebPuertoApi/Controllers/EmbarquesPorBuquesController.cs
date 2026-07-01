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
	public class EmbarquesPorBuquesController : BaseController
	{
		public EmbarquesPorBuquesController(IServicioRepositorio servicio) : base(servicio)
		{
		}

		[HttpGet]
		[Autorizacion(PermisosScato.EmbarquesPorBuques_Ver)]
		[Route("api/EmbarquesPorBuques/Listar")]
		public HttpResponseMessage Listar([FromUri] CargaFiltroDto filtro, int pagina = 1, string ordenarPor = "Fecha", DirOrden dirOrden = DirOrden.Asc)
		{
			var paginacion = new Paginacion(ordenarPor, dirOrden, pagina);
			var resultado = servicio.ListarEmbarquePorBuques(filtro, paginacion);
			return Request.CreateResponse(HttpStatusCode.OK, resultado);
		}

		[HttpGet]
		[Autorizacion(PermisosScato.EmbarquesPorBuques_Ver)]
		[Route("api/EmbarquesPorBuques/ObtenerCarga")]
		public HttpResponseMessage ObtenerCarga(int id, string numeroBalanza)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerCarga(id, numeroBalanza));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.EmbarquesPorBuques_Ver)]
		[Route("api/EmbarquesPorBuques/TotalEmbarcado")]
		public HttpResponseMessage TotalEmbarcado(int cargaInicialId, string cargaInicialNumeroBalanza)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.TotalEmbarcado(cargaInicialId, cargaInicialNumeroBalanza));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.EmbarquesPorBuques_Ver)]
		[Route("api/EmbarquesPorBuques/BalanzadasFaltantes")]
		public HttpResponseMessage BalanzadasFaltantes(int id, int idFin, string numeroBalanza)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarBalanzadasFaltantesPorRango(id, idFin, numeroBalanza));
		}
	}
}
