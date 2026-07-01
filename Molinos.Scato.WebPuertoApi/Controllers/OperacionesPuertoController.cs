using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
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
	public class OperacionesPuertoController : BaseController
	{
		private readonly IServicioComandos servicioComandos;

		public OperacionesPuertoController(
			IServicioRepositorio servicio,
			IServicioComandos servicioComandos)
			: base(servicio)
		{
			this.servicioComandos = servicioComandos;
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ListarCargas")]
		public HttpResponseMessage ListarCargas([FromUri] CargaFiltroDto filtro, int pagina = 1, string ordenarPor = "Fecha", DirOrden dirOrden = DirOrden.Asc)
		{
			var paginacion = new Paginacion(ordenarPor, dirOrden, pagina);
			var resultado = servicio.ListarPaginadoCargas(filtro, paginacion);
			return Request.CreateResponse(HttpStatusCode.OK, resultado);
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ListarBalanzadas")]
		public HttpResponseMessage ListarBalanzadas(int id, int? idFin, string numeroBalanza, bool? enviado, int pagina = 1, string ordenarPor = "Id", DirOrden dirOrden = DirOrden.Asc)
		{
			var paginacion = new Paginacion(ordenarPor, dirOrden, pagina);
			var resultado = servicio.ListarPaginadoBalanzadas(id, idFin, numeroBalanza, enviado, paginacion);
			return Request.CreateResponse(HttpStatusCode.OK, resultado);
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ObtenerCarga")]
		public HttpResponseMessage ObtenerCarga(int id, string numeroBalanza)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerCarga(id, numeroBalanza));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/TotalEmbarcado")]
		public HttpResponseMessage TotalEmbarcado(int cargaInicialId, string cargaInicialNumeroBalanza)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.TotalEmbarcado(cargaInicialId, cargaInicialNumeroBalanza));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/BalanzadasFaltantes")]
		public HttpResponseMessage BalanzadasFaltantes(int id, int idFin, string numeroBalanza)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarBalanzadasFaltantesPorRango(id, idFin, numeroBalanza));
		}

		[HttpPost]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/EnviarASap")]
		public HttpResponseMessage EnviarASap([FromBody] EnviarLecturaBalanzadaTransmisionASap comando)
		{
			try
			{
				servicioComandos.Ejecutar(comando);
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}
	}
}
