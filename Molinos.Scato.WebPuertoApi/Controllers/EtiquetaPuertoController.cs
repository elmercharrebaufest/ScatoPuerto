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
using System.Configuration;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Sockets;
using System.Text;
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
				var nombre = ResolverNombreUsuario();
				var usuario = servicio.ObtenerUsuarioId(nombre);
				if (usuario == null)
					return Request.CreateResponse(HttpStatusCode.NotFound, "Usuario no encontrado");

				var etiqueta = ObtenerEtiquetaPorId(usuario.Id, id);
				if (etiqueta == null)
					return Request.CreateResponse(HttpStatusCode.NotFound, "Etiqueta no encontrada");

				var zpl = GenerarZpl(etiqueta);
				var imagen = ObtenerImagenDesdeZebra(zpl, ObtenerIpZebra());
				if (imagen == null || imagen.Length == 0)
					return Request.CreateResponse(HttpStatusCode.InternalServerError, "No se pudo generar la previsualización");

				var response = Request.CreateResponse(HttpStatusCode.OK);
				response.Content = new ByteArrayContent(imagen);
				response.Content.Headers.ContentType = new MediaTypeHeaderValue("image/png");
				response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline")
				{
					FileName = "vistaPreviaEtiquetaPuerto.png"
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

				var etiquetas = request?.IdEtiqueta > 0
					? new List<ImpEtiquetaPuertoDto> { ObtenerEtiquetaPorId(usuario.Id, request.IdEtiqueta.Value) }
					: ObtenerEtiquetasUsuario(usuario.Id);

				etiquetas = etiquetas.Where(x => x != null).ToList();
				if (!etiquetas.Any())
					return Request.CreateResponse(HttpStatusCode.BadRequest, "No hay etiquetas para imprimir");

				var ip = string.IsNullOrWhiteSpace(request?.Impresora) ? ObtenerIpZebra() : request.Impresora;
				foreach (var etiqueta in etiquetas)
				{
					var zpl = GenerarZpl(etiqueta);
					EnviarZplAImpresora(ip, zpl);
				}

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

		private List<ImpEtiquetaPuertoDto> ObtenerEtiquetasUsuario(int usuarioId)
		{
			const int itemsPorPagina = 200;
			var pagina = 1;
			var resultado = new List<ImpEtiquetaPuertoDto>();
			while (true)
			{
				var paginado = servicio.ListarEtiquetasPuerto(usuarioId, new Paginacion("Id", DirOrden.Asc, pagina, itemsPorPagina));
				var items = paginado?.Items?.ToList() ?? new List<ImpEtiquetaPuertoDto>();
				if (!items.Any())
					break;

				resultado.AddRange(items);
				if (items.Count < itemsPorPagina)
					break;

				pagina++;
			}
			return resultado;
		}

		private ImpEtiquetaPuertoDto ObtenerEtiquetaPorId(int usuarioId, int id)
		{
			return ObtenerEtiquetasUsuario(usuarioId).FirstOrDefault(x => x.Id == id);
		}

		private static string ObtenerIpZebra()
		{
			return ConfigurationManager.AppSettings["ZebraPrinterIp"] ?? "10.10.105.96";
		}

		private static string GenerarZpl(ImpEtiquetaPuertoDto etiqueta)
		{
			var disenio = "^XA\r\n~TA000~JSN^LT0^MNW^MTT^PON^PMN^LH0,0^JMA^PR5,5^MD15^LRN^CI0\r\n^MMT\r\n^PW609\r\n^LL0406\r\n^LS0\r\n^FO8,12^GB593,350,4^FS\r\n^FT66,272^A0N,28,28^FH\r\n^FO440,30^GFA,935,935,17,,:gG01F,W0LF,W0FFC3FF,U0707F03FF,T01E07F07FF,T07E07F07FF,T0FE07E07FF,S01FE07807FE,S03FE0780FFE,S07FC0700FFC,S0FF98710FFC,S0FF18630FF8,R01FE18470FF8,R01FE380E0FF,R03FE380E0FF,R03FE781E1FE,R03FC781E1FC,R03F1F87E1F,R03F1F8FE1E,R03F1F8FC1C,R03F1F9FC18,R07LF,R07KF,R078,,::::::::038038,0380F07E0E038E0607E0F801F81FC671F803C1F0FE0E030E061FF0FC07F87FC667F807C1E1EF0E030E0E1FF1EC0FF8FFC6E7F807C3E3C30E071F0E3871C00E38F1C7CE3807C3C7039C061F1E7071C03839C1CE1C1C06C4C7039C0E1D9E7071E03031818E181C06IC7039C0E1D9E6070F03073818C38180CDDC707180E18FCE0F0F07073031838380CFBC70E381E38FCE0F03070F7071838381CF3C70E381E387CE0F03070F38F3838781C63C7FE3FDE38387FCFF07FF3FF381FF,3C63C3FC3F9C30383F8FF03F61F7381FE,3C43C3F03F9C70103F07C03EE0FF380FC,gM0E,:gK063C,gK07F8,,:^FS\r\n^FT21,106^A0N,28,28^FH\\^FDVapor: {0}^FS\r\n^FT21,139^A0N,28,28^FH\\^FDCargador: {1}^FS\r\n^FT21,172^A0N,28,28^FH\\^FDMercaderia: {2}^FS\r\n^FT21,205^A0N,28,28^FH\\^FDDestino: {3}^FS\r\n^FT21,238^A0N,28,28^FH\\^FDKg: {4}^FS\r\n^FT21,271^A0N,28,28^FH\\^FDNro de Lote: {5}^FS\r\n^FT350,271^A0N,28,28^FH\\^FDBodega: {6}^FS\r\n^FT21,304^A0N,28,28^FH\\^FDControl: {7}^FS\r\n^FT21,337^A0N,28,28^FH\\^FDFecha: {8}^FS\r\n^XZ\r\n";
			return string.Format(disenio,
				etiqueta.Vapor,
				etiqueta.Cargador,
				etiqueta.Mercaderia,
				etiqueta.Destino,
				etiqueta.Kg,
				etiqueta.NumeroLote,
				etiqueta.Bodega,
				etiqueta.Control,
				etiqueta.Fecha?.ToString("dd/MM/yyyy"));
		}

		private static void EnviarZplAImpresora(string ip, string zpl)
		{
			using (var tcp = new TcpClient())
			{
				tcp.Connect(ip, 9100);
				var bytes = Encoding.ASCII.GetBytes(zpl);
				using (var stream = tcp.GetStream())
				{
					stream.Write(bytes, 0, bytes.Length);
					stream.Flush();
				}
			}
		}

		private static byte[] ObtenerImagenDesdeZebra(string zpl, string ip)
		{
			var response = HttpPost($"http://{ip}/zpl", "data=" + zpl + "&dev=R&oname=UNKNOWN&otype=ZPL&prev=Preview Label&pw=");
			if (string.IsNullOrWhiteSpace(response))
				return null;

			var marker = "alt=\"";
			var start = response.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
			if (start < 0)
				return null;
			start += marker.Length;
			var end = response.IndexOf("\"", start, StringComparison.OrdinalIgnoreCase);
			if (end <= start)
				return null;

			var imageName = response.Substring(start, end - start);
			if (imageName.StartsWith("R:", StringComparison.OrdinalIgnoreCase))
				imageName = imageName.Substring(2);
			if (imageName.EndsWith(".PNG", StringComparison.OrdinalIgnoreCase))
				imageName = imageName.Substring(0, imageName.Length - 4);

			using (var client = new System.Net.WebClient())
			{
				return client.DownloadData($"http://{ip}/png?prev=Y&dev=R&oname={imageName}&otype=PNG");
			}
		}

		private static string HttpPost(string uri, string parameters)
		{
			var req = System.Net.WebRequest.Create(uri);
			req.Proxy = new System.Net.WebProxy();
			req.ContentType = "application/x-www-form-urlencoded";
			req.Method = "POST";
			var bytes = Encoding.ASCII.GetBytes(parameters);
			req.ContentLength = bytes.Length;

			using (var os = req.GetRequestStream())
			{
				os.Write(bytes, 0, bytes.Length);
			}

			using (var resp = req.GetResponse())
			using (var sr = new StreamReader(resp.GetResponseStream()))
			{
				return sr.ReadToEnd().Trim();
			}
		}
	}
}
