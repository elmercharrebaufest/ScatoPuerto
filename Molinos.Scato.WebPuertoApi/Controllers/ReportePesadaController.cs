using Molinos.Scato.Dominio.Consultas;
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
		[Autorizacion(PermisosScato.ReportePesada_Ver)]
		[Route("api/ReportePesada/Listar")]
		public HttpResponseMessage Listar(DateTime fechaDesde, DateTime fechaHasta, int? exportadorId = null, int? materialId = null, int pagina = 1)
		{
			var paginacion = new Paginacion(null, DirOrden.Asc, pagina);
			var resultado = servicio.ListarReporteDePesadasPorTurno(fechaDesde, fechaHasta, paginacion, exportadorId, materialId);
			return Request.CreateResponse(HttpStatusCode.OK, resultado);
		}

		[HttpGet]
		[Autorizacion(PermisosScato.ReportePesada_Ver)]
		[Route("api/ReportePesada/ListarExportadores")]
		public HttpResponseMessage ListarExportadores()
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ListaExportadores());
		}

		[HttpGet]
		[Autorizacion(PermisosScato.ReportePesada_Ver)]
		[Route("api/ReportePesada/ListarMateriales")]
		public HttpResponseMessage ListarMateriales()
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ListaMaterialesPuerto());
		}
	}
}
