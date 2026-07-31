using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
	[BasicAuthFilter]
	public class EtiquetaPuertoController : BaseController
	{
		private readonly IServicioComandos servicioComandos;
		private const string ImpresoraPuertoDefault = "10.10.104.15";

		public EtiquetaPuertoController(IServicioRepositorio servicio, IServicioComandos servicioComandos)
			: base(servicio)
		{
			this.servicioComandos = servicioComandos;
		}

		private string ResolverNombreUsuario(string usuarioFromRequest = null)
		{
			if (!string.IsNullOrWhiteSpace(usuarioFromRequest))
				return usuarioFromRequest.Split('@')[0];
			if (!string.IsNullOrWhiteSpace(nombreUsuario))
				return nombreUsuario.Split('@')[0];
			return null;
		}

		[HttpGet]
		[Autorizacion(PermisosScato.EtiquetaPuerto_Ver, PermisosScato.Carga_Ver)]
		[Route("api/EtiquetaPuerto/Listar")]
		public HttpResponseMessage Listar(int pagina = 1, string usuario = null)
		{
			var nombre = ResolverNombreUsuario(usuario);
			var usuarioDto = servicio.ObtenerUsuarioId(nombre);
			if (usuarioDto == null)
				return Request.CreateResponse(HttpStatusCode.NotFound, "Usuario no encontrado");
			var paginacion = new Paginacion("Id", DirOrden.Asc, pagina, 10);
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarEtiquetasPuerto(usuarioDto.Id, paginacion));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.EtiquetaPuerto_Ver, PermisosScato.Carga_Ver)]
		[Route("api/EtiquetaPuerto/DescargarTemplate")]
		public HttpResponseMessage DescargarTemplate()
		{
			var workbook = new HSSFWorkbook();
			var sheet = workbook.CreateSheet("Etiquetas Puerto");

			var titulo = sheet.CreateRow(0);
			titulo.CreateCell(2).SetCellValue("Datos a cargar para las etiquetas del buque");

			var header = sheet.CreateRow(1);
			header.CreateCell(0).SetCellValue("Vapor");
			header.CreateCell(1).SetCellValue("Cargador");
			header.CreateCell(2).SetCellValue("Mercadería");
			header.CreateCell(3).SetCellValue("Destino");
			header.CreateCell(4).SetCellValue("Kg");
			header.CreateCell(5).SetCellValue("N° de Lote");
			header.CreateCell(6).SetCellValue("Bodega");
			header.CreateCell(7).SetCellValue("Control");
			header.CreateCell(8).SetCellValue("Fecha (dd/mm/aaaa)");

			for (var i = 0; i <= 8; i++)
				sheet.AutoSizeColumn(i);

			byte[] bytes;
			using (var ms = new MemoryStream())
			{
				workbook.Write(ms);
				bytes = ms.ToArray();
			}

			var response = Request.CreateResponse(HttpStatusCode.OK);
			response.Content = new ByteArrayContent(bytes);
			response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/vnd.ms-excel");
			response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
			{
				FileName = "EtiquetaPuertoTemplate.xls"
			};
			return response;
		}

		[HttpPost]
		[Autorizacion(PermisosScato.EtiquetaPuerto_Ver, PermisosScato.Carga_Ver)]
		[Route("api/EtiquetaPuerto/Importar")]
		public HttpResponseMessage Importar()
		{
			try
			{
				var request = HttpContext.Current?.Request;
				var usuarioParam = request?.Form["usuario"];
				var nombre = ResolverNombreUsuario(usuarioParam);
				var usuarioDto = servicio.ObtenerUsuarioId(nombre);
				if (usuarioDto == null)
					return Request.CreateResponse(HttpStatusCode.NotFound, "Usuario no encontrado");

				if (request?.Files == null || request.Files.Count == 0)
					return Request.CreateResponse(HttpStatusCode.BadRequest, "Seleccione un archivo");

				var errores = new List<string>();
				var etiquetas = CargarArchivo(request.Files[0].InputStream, errores);

				if (errores.Any())
					return Request.CreateResponse(HttpStatusCode.BadRequest, new { Errores = errores });

				servicioComandos.Ejecutar(new EliminarEtiquetaPuerto { UsuarioId = usuarioDto.Id });
				foreach (var etiqueta in etiquetas)
				{
					etiqueta.Usuario_Id = usuarioDto.Id;
					etiqueta.Usuario = null;
					var resultado = servicioComandos.Ejecutar(new GuardarEtiquetaPuerto { Etiqueta = etiqueta });
					if (resultado.HayErrores)
					{
						var detalle = resultado.Errores?.Values?.FirstOrDefault();
						return Request.CreateResponse(HttpStatusCode.BadRequest, new
						{
							Errores = resultado.Errores.Values.ToList(),
							Detalle = detalle
						});
					}
					etiqueta.Id = (resultado as ResultadoCrear)?.Id ?? 0;
				}

				var paginacion = new Paginacion("Id", DirOrden.Asc, 1, 10);
				return Request.CreateResponse(HttpStatusCode.OK, new
				{
					Mensaje = "Se grabó correctamente",
					Items = etiquetas
				});
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpGet]
		[Autorizacion(PermisosScato.EtiquetaPuerto_Ver, PermisosScato.Carga_Ver)]
		[Route("api/EtiquetaPuerto/Previsualizar/{id}")]
		public HttpResponseMessage Previsualizar(int id)
		{
			try
			{
				var resultado = servicioComandos.Ejecutar(new ImprimirEtiquetaPuerto
				{
					UsuarioId = 0,
					ImpresoraId = 0,
					Id = id,
					Impresora = string.Empty
				});

				if (resultado.HayErrores)
					return Request.CreateResponse(HttpStatusCode.BadRequest, resultado.Errores.Values.FirstOrDefault());

				var archivo = (resultado as ResultadoPrevisualizar)?.Archivo;
				if (archivo == null)
					return Request.CreateResponse(HttpStatusCode.InternalServerError, "No se pudo generar la previsualización");

				var response = Request.CreateResponse(HttpStatusCode.OK);
				response.Content = new ByteArrayContent(archivo);
				response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
				response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline")
				{
					FileName = "vistaPreviaEtiquetaPuerto.pdf"
				};
				return response;
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPost]
		[Autorizacion(PermisosScato.EtiquetaPuerto_Ver, PermisosScato.Carga_Ver)]
		[Route("api/EtiquetaPuerto/Imprimir")]
		public HttpResponseMessage Imprimir([FromBody] ImprimirEtiquetaPuertoRequest request)
		{
			try
			{
				var nombre = ResolverNombreUsuario(request?.Username);
				var usuario = servicio.ObtenerUsuarioId(nombre);
				if (usuario == null)
					return Request.CreateResponse(HttpStatusCode.NotFound, "Usuario no encontrado");

				var comando = new ImprimirEtiquetaPuerto
				{
					UsuarioId = (request?.IdEtiqueta).HasValue ? 0 : usuario.Id,
					Id = request?.IdEtiqueta ?? 0,
					ImpresoraId = request?.ImpresoraId ?? 0,
					Impresora = string.IsNullOrWhiteSpace(request?.Impresora) ? ImpresoraPuertoDefault : request.Impresora
				};

				var resultado = servicioComandos.Ejecutar(comando);
				if (resultado.HayErrores)
					return Request.CreateResponse(HttpStatusCode.BadRequest, resultado.Errores.Values.FirstOrDefault());

				return Request.CreateResponse(HttpStatusCode.OK, "Impresión enviada correctamente");
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPost]
		[Autorizacion(PermisosScato.EtiquetaPuerto_Ver, PermisosScato.Carga_Ver)]
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
		[Autorizacion(PermisosScato.EtiquetaPuerto_Ver, PermisosScato.Carga_Ver)]
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
		[Autorizacion(PermisosScato.EtiquetaPuerto_Ver, PermisosScato.Carga_Ver)]
		[Route("api/EtiquetaPuerto/Eliminar")]
		public HttpResponseMessage Eliminar(string usuario = null)
		{
			try
			{
				var nombre = ResolverNombreUsuario(usuario);
				var usuarioDto = servicio.ObtenerUsuarioId(nombre);
				if (usuarioDto == null)
					return Request.CreateResponse(HttpStatusCode.NotFound, "Usuario no encontrado");
				servicioComandos.Ejecutar(new EliminarEtiquetaPuerto { UsuarioId = usuarioDto.Id });
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		private static List<ImpEtiquetaPuertoDto> CargarArchivo(Stream stream, List<string> errores)
		{
			var doc = new XSSFWorkbook(stream);
			var result = new List<ImpEtiquetaPuertoDto>();
			var sheet = doc.GetSheetAt(0);

			for (int row = 2; row <= sheet.LastRowNum; row++)
			{
				var r = sheet.GetRow(row);
				if (r == null)
					continue;

				var columnasErrores = new List<string>();
				var vapor = GetCellValue(r.GetCell(0));
				var cargador = GetCellValue(r.GetCell(1));
				var mercaderia = GetCellValue(r.GetCell(2));
				var destino = GetCellValue(r.GetCell(3));
				var kgRaw = GetCellValue(r.GetCell(4));
				var numeroLote = GetCellValue(r.GetCell(5));
				var bodega = GetCellValue(r.GetCell(6));
				var control = GetCellValue(r.GetCell(7));
				var fechaCell = r.GetCell(8);

				var fecha = ParseFecha(fechaCell);
				if (string.IsNullOrWhiteSpace(vapor)) columnasErrores.Add("Vapor");
				if (!string.IsNullOrWhiteSpace(GetCellValue(fechaCell)) && !fecha.HasValue) columnasErrores.Add("Fecha");

				var kg = ParseKg(kgRaw);
				if (!string.IsNullOrWhiteSpace(kgRaw) && kg <= 0) columnasErrores.Add("Kg");

				var filaConDatos = string.Concat(vapor, cargador, mercaderia, destino, kgRaw, numeroLote, bodega, control, GetCellValue(fechaCell));
				if (columnasErrores.Count > 0)
				{
					if (!string.IsNullOrWhiteSpace(filaConDatos))
						errores.Add(string.Format("La fila {0} tiene los campos {1} incorrectos o incompletos.", row + 1, string.Join(", ", columnasErrores)));
					continue;
				}

				if (string.IsNullOrWhiteSpace(filaConDatos))
					continue;

				var nfi = new CultureInfo("en-US", false).NumberFormat;
				nfi.CurrencyDecimalSeparator = ",";
				nfi.CurrencyGroupSeparator = ".";
				nfi.CurrencySymbol = "";

				result.Add(new ImpEtiquetaPuertoDto
				{
					Vapor = vapor,
					Cargador = cargador,
					Mercaderia = mercaderia,
					Destino = destino,
					Kg = kg > 0 ? Convert.ToDecimal(kg).ToString("C0", nfi) : string.Empty,
					NumeroLote = numeroLote,
					Bodega = bodega,
					Control = control,
					Fecha = fecha
				});
			}

			return result;
		}

		private static string GetCellValue(ICell cell)
		{
			return cell == null ? string.Empty : cell.ToString()?.Trim() ?? string.Empty;
		}

		private static DateTime? ParseFecha(ICell cell)
		{
			if (cell == null)
				return null;

			if (cell.CellType == CellType.Numeric && DateUtil.IsCellDateFormatted(cell))
				return cell.DateCellValue;

			var raw = GetCellValue(cell);
			if (string.IsNullOrWhiteSpace(raw))
				return null;

			if (DateTime.TryParseExact(raw, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var fecha))
				return fecha;

			if (DateTime.TryParse(raw, out fecha))
				return fecha;

			return null;
		}

		private static int ParseKg(string kgRaw)
		{
			if (string.IsNullOrWhiteSpace(kgRaw))
				return 0;

			var normalizado = kgRaw.Replace(".", string.Empty).Replace(",", string.Empty).Trim();
			if (int.TryParse(normalizado, out var kg))
				return kg;

			if (decimal.TryParse(kgRaw, NumberStyles.Any, CultureInfo.InvariantCulture, out var dec))
				return Convert.ToInt32(dec);

			if (decimal.TryParse(kgRaw, NumberStyles.Any, new CultureInfo("es-AR"), out dec))
				return Convert.ToInt32(dec);

			return 0;
		}

		public class ImprimirEtiquetaPuertoRequest
		{
			public string Username { get; set; }
			public int? IdEtiqueta { get; set; }
			public int? ImpresoraId { get; set; }
			public string Impresora { get; set; }
		}
	}
}
