using System;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.Web.Atributos;
using Molinos.Scato.Web.Helpers;
using Molinos.Scato.Web.Models;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Web.Controllers
{
    [Autorizacion(PermisosScato.DocumentoExterno)]
    public class DocumentoExternoController : BaseController
    {
        private readonly ILogger log;
        private readonly IServicioComandos servicioComandos;

        public DocumentoExternoController(ILogger log, IServicioRepositorio servicio, IServicioComandos servicioComandos)
            : base(servicio)
        {
            this.log = log;
            this.servicioComandos = servicioComandos;
        }
        public ActionResult Index(string filtro, int pagina = 1, string ordenarPor = "Id", DirOrden dirOrden = DirOrden.Desc) {
            ListQuery(filtro, pagina, ordenarPor, dirOrden);
            return View((object)filtro);
        }

        [AjaxOnly]
        [ActionName("Index")]
        public ActionResult Listar(string filtro, int pagina = 1, string ordenarPor = "Id", DirOrden dirOrden = DirOrden.Desc)
        {
            ListQuery(filtro, pagina, ordenarPor, dirOrden);
            return View("Listar", (object)filtro);
        }

        private void ListQuery(string filtro, int pagina, string ordenarPor, DirOrden dirOrden)
        {
            var paginacion = new Paginacion(ordenarPor, dirOrden, pagina, 10);

            ViewBag.Items = servicio.ListarDocumentos(filtro, paginacion);
        }

        [DatosUsuario]
        [HttpPost]
        public ActionResult Index(DocumentoExternoDto model, DatosUsuario datosUsuario, string filtro = "", int pagina = 1, string ordenarPor = "Id", DirOrden dirOrden = DirOrden.Desc)
        {
            if (ModelState.IsValid)
            {
                if (Request.Files.Count > 0)
                {
                    for (int i = 0; i < Request.Files.Count; i++)
                    {
                        var archivo = GenerarDto(Request.Files[i]);
                        archivo.ArchivoRutaDestino = servicio.GuardarArchivoFotoDocumentoExterno(archivo.ArchivoRutaDestino, archivo.ArchivoExtension, archivo.NumeroDeDocumento);
                        var resultado = servicioComandos.Ejecutar(new CrearDocumentoExterno { Dto = archivo, Usuario = datosUsuario.NombreUsuario });
                        if (resultado.HayErrores)
                        {
                            ModelState.AgregarErrores(resultado);
                        }
                        else
                        {
                            ViewBag.success = "Se grabó correctamente";
                        }
                    }
                }
                else
                {
                    ModelState.AddModelError("ArchivoRutaDestino", "Seleccione un archivo");
                }
            }
            ListQuery(filtro, pagina, ordenarPor, dirOrden);
            return View("Index");
        }

        private DocumentoExternoDto GenerarDto(HttpPostedFileBase file)
        {
            System.IO.Stream fs = file.InputStream;
            System.IO.BinaryReader br = new System.IO.BinaryReader(fs);
            Byte[] bytes = br.ReadBytes((Int32)fs.Length);

            var numeroDocumento = Path.GetFileName(file.FileName).Split('.').First();

            if (!Regex.IsMatch(numeroDocumento, "\\d{12}") && !Regex.IsMatch(numeroDocumento, "\\d{9}"))
            {
                var leerNumeroCartaPorteComando = new LeerNumeroCartaPorte
                {
                    CodigoBarrasCartaPorte = bytes,
                    NombreArchivo = Path.GetFileName(file.FileName)
                };

                var resultado = (ResultadoLeerNumeroCartaPorte)servicioComandos.Ejecutar(leerNumeroCartaPorteComando);
                numeroDocumento = resultado.NumeroCartaPorte;
            }

            return new DocumentoExternoDto
            {
                NumeroDeDocumento = numeroDocumento,
                ArchivoExtension = Path.GetFileName(file.FileName).Split('.').Last(),
                ArchivoRutaDestino = Convert.ToBase64String(bytes, 0, bytes.Length)
            };
        }

        public FileResult DescargarArchivos(int id)
        {
            try
            {
                var file = servicio.ObtenerAdjuntoDocumentoExterno(id);
                System.Web.HttpContext.Current.Response.SetCookie(new HttpCookie("RetornoArchivo", "ok"));

                return File(file.Archivo, System.Net.Mime.MediaTypeNames.Application.Octet, file.NumeroDeDocumento + "." + file.ArchivoExtension);
            }
            catch (Exception e)
            {
                System.Web.HttpContext.Current.Response.SetCookie(new HttpCookie("RetornoArchivo", "error"));
                return null;
            }
        }

        [HttpPost]
        public ActionResult Eliminar(int id)
        {
            var resultado = servicioComandos.Ejecutar(new EliminarDocumentoExterno { Id = id });
            return Content(!resultado.HayErrores ? "true" : resultado.Errores.Values.First());
        }

        public ActionResult Modificar(int id)
        {
            var tipo = servicio.ObtenerDocumentoExterno(id);
            return View(tipo);
        }

        [HttpPost]
        public ActionResult Modificar(DocumentoExternoDto tipo)
        {
            if (ModelState.IsValid)
            {
                var resultado = servicioComandos.Ejecutar(new ModificarDocumentoExterno { Dto = tipo });
                if (!resultado.HayErrores)
                {
                    return new AjaxEditSuccessResult();
                }
                ModelState.AgregarErrores(resultado);
            }
            return View(tipo);
        }
    }
}