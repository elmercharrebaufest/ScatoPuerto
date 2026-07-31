using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
	[BasicAuthFilter]
	public class ReportePesadaController : BaseController
	{
		public ReportePesadaController(IServicioRepositorio servicio) : base(servicio)
		{
		}

		[HttpGet]
		[Autorizacion(PermisosScato.ReportePesada_Ver, PermisosScato.LineUp_Ver, PermisosScato.Embarques_Ver)]
		[Route("api/ReportePesada/Listar")]
		public HttpResponseMessage Listar(
			DateTime fechaDesde,
			DateTime fechaHasta,
			int? exportadorId = null,
			int? materialId = null,
			int pagina = 1,
			string ordenarPor = "Fecha",
			DirOrden dirOrden = DirOrden.Asc,
			int itemsPorPagina = 10)
		{
			var paginacion = new Paginacion(ordenarPor, dirOrden, pagina, itemsPorPagina);
			var resultado = servicio.ListarReporteDePesadasPorTurno(
				fechaDesde.InicioDelDia(),
				fechaHasta.FinDelDia(),
				paginacion,
				exportadorId,
				materialId);
			return Request.CreateResponse(HttpStatusCode.OK, resultado);
		}

		[HttpGet]
		[Autorizacion(PermisosScato.ReportePesada_Ver, PermisosScato.LineUp_Ver, PermisosScato.Embarques_Ver)]
		[Route("api/ReportePesada/ListarExportadores")]
		public HttpResponseMessage ListarExportadores()
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ListaExportadores());
		}

		[HttpGet]
		[Autorizacion(PermisosScato.ReportePesada_Ver, PermisosScato.LineUp_Ver, PermisosScato.Embarques_Ver)]
		[Route("api/ReportePesada/ListarMateriales")]
		public HttpResponseMessage ListarMateriales()
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ListaMaterialesPuerto());
		}
	}
}
