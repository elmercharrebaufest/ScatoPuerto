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

		[HttpGet]
		[Autorizacion(PermisosScato.BalanzaPuerto_Configuracion)]
		[Route("api/BalanzaPuerto/Listar")]
		public HttpResponseMessage Listar(string filtro = null, int pagina = 1)
		{
			try
			{
				var paginacion = new Paginacion(null, DirOrden.Asc, pagina);
				return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarBalanzasPuertoPaginado(string.IsNullOrEmpty(filtro) ? null : filtro, paginacion));
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPost]
		[Autorizacion(PermisosScato.BalanzaPuerto_Configuracion)]
		[Route("api/BalanzaPuerto/Crear")]
		public HttpResponseMessage Crear([FromBody] BalanzaPuertoDto dto)
		{
			try
			{
				servicioComandos.Ejecutar(new CrearBalanzaPuerto { Dto = dto });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPut]
		[Autorizacion(PermisosScato.BalanzaPuerto_Configuracion)]
		[Route("api/BalanzaPuerto/Modificar")]
		public HttpResponseMessage Modificar([FromBody] BalanzaPuertoDto dto)
		{
			try
			{
				servicioComandos.Ejecutar(new ModificarBalanzaPuerto { Dto = dto });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpDelete]
		[Autorizacion(PermisosScato.BalanzaPuerto_Configuracion)]
		[Route("api/BalanzaPuerto/Eliminar/{id}")]
		public HttpResponseMessage Eliminar(int id)
		{
			try
			{
				servicioComandos.Ejecutar(new EliminarBalanzaPuerto { Id = id });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}
	}
}
