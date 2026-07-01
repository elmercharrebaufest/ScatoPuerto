using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
	[BasicAuthFilter]
	public class EtiquetaPuertoController : BaseController
	{
		private readonly IServicioComandos servicioComandos;

		public EtiquetaPuertoController(IServicioRepositorio servicio, IServicioComandos servicioComandos)
			: base(servicio)
		{
			this.servicioComandos = servicioComandos;
		}

		[HttpGet]
		[Autorizacion(PermisosScato.EtiquetaPuerto_Ver)]
		[Route("api/EtiquetaPuerto/Listar")]
		public HttpResponseMessage Listar(string username, int pagina = 1)
		{
			var usuario = servicio.ObtenerUsuarioId(username);
			if (usuario == null)
				return Request.CreateResponse(HttpStatusCode.NotFound, "Usuario no encontrado");
			var paginacion = new Paginacion(null, DirOrden.Asc, pagina);
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarEtiquetasPuerto(usuario.Id, paginacion));
		}

		[HttpPost]
		[Autorizacion(PermisosScato.EtiquetaPuerto_Ver)]
		[Route("api/EtiquetaPuerto/Guardar")]
		public HttpResponseMessage Guardar([FromBody] ImpEtiquetaPuertoDto etiqueta)
		{
			try
			{
				servicioComandos.Ejecutar(new GuardarEtiquetaPuerto { Etiqueta = etiqueta });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPost]
		[Autorizacion(PermisosScato.EtiquetaPuerto_Ver)]
		[Route("api/EtiquetaPuerto/GuardarLote")]
		public HttpResponseMessage GuardarLote([FromBody] List<ImpEtiquetaPuertoDto> etiquetas)
		{
			try
			{
				foreach (var etiqueta in etiquetas)
					servicioComandos.Ejecutar(new GuardarEtiquetaPuerto { Etiqueta = etiqueta });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpDelete]
		[Autorizacion(PermisosScato.EtiquetaPuerto_Ver)]
		[Route("api/EtiquetaPuerto/Eliminar/{username}")]
		public HttpResponseMessage Eliminar(string username)
		{
			try
			{
				var usuario = servicio.ObtenerUsuarioId(username);
				if (usuario == null)
					return Request.CreateResponse(HttpStatusCode.NotFound, "Usuario no encontrado");
				servicioComandos.Ejecutar(new EliminarEtiquetaPuerto { UsuarioId = usuario.Id });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}
	}
}
