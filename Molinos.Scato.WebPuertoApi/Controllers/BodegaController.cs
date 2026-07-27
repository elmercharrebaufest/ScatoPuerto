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
	public class BodegaController : BaseController
	{
		private readonly IServicioComandos servicioComandos;

		public BodegaController(
			IServicioRepositorio servicio,
			IServicioComandos servicioComandos)
			: base(servicio)
		{
			this.servicioComandos = servicioComandos;
		}

		[HttpGet]
		[Autorizacion(PermisosScato.ConfiguracionPuerto_Ver)]
		[Route("api/Bodega/Listar")]
		public HttpResponseMessage Listar(string filtro = null, int pagina = 1, string ordenarPor = "Id", DirOrden dirOrden = DirOrden.Asc)
		{
			try
			{
				var paginacion = new Paginacion(ordenarPor, dirOrden, pagina);
				return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarBodegas(paginacion, string.IsNullOrEmpty(filtro) ? null : filtro));
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPost]
		[Autorizacion(PermisosScato.ConfiguracionPuerto_Ver)]
		[Route("api/Bodega/Crear")]
		public HttpResponseMessage Crear([FromBody] BodegaDto dto)
		{
			try
			{
				servicioComandos.Ejecutar(new CrearBodega { Dto = dto });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPut]
		[Autorizacion(PermisosScato.ConfiguracionPuerto_Ver)]
		[Route("api/Bodega/Modificar")]
		public HttpResponseMessage Modificar([FromBody] BodegaDto dto)
		{
			try
			{
				servicioComandos.Ejecutar(new ModificarBodega { Dto = dto });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpDelete]
		[Autorizacion(PermisosScato.ConfiguracionPuerto_Ver)]
		[Route("api/Bodega/Eliminar/{id}")]
		public HttpResponseMessage Eliminar(int id)
		{
			try
			{
				servicioComandos.Ejecutar(new EliminarBodega { Id = id });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}
	}
}
