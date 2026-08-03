using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
	[BasicAuthFilter]
	public class BalanzaPuertoController : BaseController
	{
		private readonly IServicioComandos servicioComandos;

		public BalanzaPuertoController(
			IServicioRepositorio servicio,
			IServicioComandos servicioComandos)
			: base(servicio)
		{
			this.servicioComandos = servicioComandos;
		}

		private string ObtenerUsuario()
		{
			if (Request.Headers.TryGetValues("X-Usuario", out var values))
			{
				return values.FirstOrDefault();
			}
			return null;
		}

		[HttpGet]
		[Autorizacion(PermisosScato.ConfiguracionPuerto_Ver)]
		[Route("api/BalanzaPuerto/Listar")]
		public HttpResponseMessage Listar(string filtro = null, int pagina = 1, string ordenarPor = "Id", DirOrden dirOrden = DirOrden.Asc, int itemsPorPagina = 10)
		{
			try
			{
				var paginacion = new Paginacion(ordenarPor, dirOrden, pagina, itemsPorPagina);
				var resultado = servicio.ListarBalanzasPuertoPaginado(string.IsNullOrEmpty(filtro) ? null : filtro, paginacion);
				return Request.CreateResponse(HttpStatusCode.OK, new
				{
					Items = resultado.Items,
					ItemsTotales = resultado.ItemsTotales,
					Pagina = resultado.Pagina,
					ItemsPorPagina = resultado.ItemsPorPagina
				});
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPost]
		[Autorizacion(PermisosScato.ConfiguracionPuerto_Ver)]
		[Route("api/BalanzaPuerto/Crear")]
		public HttpResponseMessage Crear([FromBody] BalanzaPuertoDto dto)
		{
			try
			{
				var usuario = servicio.ObtenerUsuarioId(this.nombreUsuario);
				dto.CentroId = usuario?.CentrosAsociados?.FirstOrDefault()?.Id ?? 5;

				servicioComandos.Ejecutar(new CrearBalanzaPuerto { Dto = dto, Usuario = this.ObtenerUsuario() });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPut]
		[Autorizacion(PermisosScato.ConfiguracionPuerto_Ver)]
		[Route("api/BalanzaPuerto/Modificar")]
		public HttpResponseMessage Modificar([FromBody] BalanzaPuertoDto dto)
		{
			try
			{
				servicioComandos.Ejecutar(new ModificarBalanzaPuerto { Dto = dto, Usuario = this.ObtenerUsuario() });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpDelete]
		[Autorizacion(PermisosScato.ConfiguracionPuerto_Ver)]
		[Route("api/BalanzaPuerto/Eliminar/{id}")]
		public HttpResponseMessage Eliminar(int id)
		{
			try
			{
				servicioComandos.Ejecutar(new EliminarBalanzaPuerto { Id = id, Usuario = this.ObtenerUsuario() });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}
	}
}
