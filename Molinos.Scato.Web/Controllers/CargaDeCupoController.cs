using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Mvc;
using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Orquestador;
using Molinos.Scato.Servicios.ServiciosSap;
using Molinos.Scato.Web.Atributos;
using Molinos.Scato.Web.Helpers;
using Molinos.Scato.Web.Models;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Web.Controllers
{
    [Autorizacion(PermisosScato.CargaDeCupo)]
    public class CargaDeCupoController : BaseController
    {
        private ILogger log;
        private readonly IServicioComandos servicioComandos;
        private readonly IListaDeWorkflows workflows;
        private readonly ZSDWS_SCATO servicioSap;
        private readonly IServicioOrquestador servicioOrquestador;

        public CargaDeCupoController(ILogger log, IServicioRepositorio servicio, IServicioComandos servicioComandos, IListaDeWorkflows workflows, ZSDWS_SCATO servicioSap, IServicioOrquestador servicioOrquestador)
            : base(servicio)
        {
            this.servicioComandos = servicioComandos;
            this.log = log;
            this.workflows = workflows;
            this.servicioSap = servicioSap;
            this.servicioOrquestador = servicioOrquestador;
        }

        [DatosUsuario]
        public ActionResult Index(DatosUsuario datosUsuario)
        {
            SetearVista(datosUsuario);
            return View();
        }

        [HttpPost]
        [DatosUsuario]
        public ActionResult Index(CargaDeCupoDto model, string imagenCartaPorte, DatosUsuario datosUsuario)
        {
            model.ImagenCartaPorte = imagenCartaPorte.Replace("data:image/jpg;base64,", "");
            ModelState.Remove("MaterialId");
            ModelState.Remove("Especial");
            if (ModelState.IsValid)
            {
                log.Debug("Asignación de cupo {0}, tarjeta {1}, centro {2}, CP {3}", model.Cupo, model.Numero, datosUsuario.CentroId, model.NumeroCartaPorte);
                if (string.IsNullOrEmpty(model.ImagenCartaPorte) && !model.SinFotoCartaPorte)
                {
                    ModelState.AddModelError("", string.Format(Textos.Error_Requerido, "Foto de CP"));
                    log.Debug("ERROR 1 de cupo {0}, tarjeta {1}, centro {2}, CP {3}", model.Cupo, model.Numero, datosUsuario.CentroId, model.NumeroCartaPorte);
                    return View("Form", model);
                }
                if (servicio.EsTarjetaBloqueada(model.Numero, datosUsuario.CentroId))
                {
                    ModelState.AddModelError("", Textos.AsignacionTarjetaDeAcceso_TarjetaBloqueada);
                    log.Debug("ERROR 2 de cupo {0}, tarjeta {1}, centro {2}, CP {3}", model.Cupo, model.Numero, datosUsuario.CentroId, model.NumeroCartaPorte);
                    return View("Form", model);
                }
                if (!servicio.EsTarjetaEnRangoValido(model.Numero, datosUsuario.CentroId))
                {
                    ModelState.AddModelError("", Textos.AsignacionTarjetaDeAcceso_TarjetaSinRango);
                    log.Debug("ERROR 3 de cupo {0}, tarjeta {1}, centro {2}, CP {3}", model.Cupo, model.Numero, datosUsuario.CentroId, model.NumeroCartaPorte);
                    return View("Form", model);
                }
                var instanciaWorkflow = servicio.ObtenerRecorridoInstanceIdPorTarjetaDeAcceso(model.Numero, datosUsuario.CentroId);
                if (workflows.VerificarExistenciaDeWorkflowPorGuid(instanciaWorkflow))
                {
                    ModelState.AddModelError("", Textos.ImpresionTarjetaDeAcceso_EnUso);
                    log.Debug("ERROR 4 de cupo {0}, tarjeta {1}, centro {2}, CP {3}", model.Cupo, model.Numero, datosUsuario.CentroId, model.NumeroCartaPorte);
                    return View("Form", model);
                }
                model.Fecha = DateTime.Now;
                model.CentroId = datosUsuario.CentroId;
                model.CentroCodigoSap = datosUsuario.CentroCodigoSap;
                var resultado = servicioComandos.Ejecutar(new CrearCargaDeCupo { Dto = model, EsGarita = true }) as ResultadoCrear;
                if (resultado.HayErrores)
                {
                    log.Debug("ERROR 5 de cupo {0}, tarjeta {1}, centro {2}, CP {3}: " + resultado.Errores.First().Value, model.Cupo, model.Numero, datosUsuario.CentroId, model.NumeroCartaPorte);
                    foreach(var r in resultado.Errores)
                    {
                        ModelState.AddModelError("", r.Value);
                    }
                }
                else
                {
                    model.FotoRutaDestino = resultado.Mensaje;
                    if (model.ImprimeTarjetaDeAcceso)
                    {
                        ImprimirTarjetaDeAcceso(model, datosUsuario, resultado);
                    }
                    if (model.ImprimeCartaPorte)
                    {
                        ImprimirDeCartaPorte(model, resultado);
                    }
                }


                if (ModelState.IsValid)
                {
                    ModelState.Clear();
                    ViewBag.MostrarAlertaExitosa = true;
                    return View("Form");
                }
            }
            return View("Form", model);
        }

        [DatosUsuario]
        public ActionResult Listar(DatosUsuario datosUsuario)
        {
            ViewBag.Items = servicio.ListarDatosDeWorkflowsPendientes(datosUsuario.CentroId, 5);
            return View();
        }

        private void ImprimirDeCartaPorte(CargaDeCupoDto model, ResultadoCrear resultado)
        {
            if (!ModelState.IsValid) return;
            var codigo = "ImpresionCartaPorteMesa";
            var documento = servicio.ObtenerDocumentoDeImpresionPorCentroCodigoPuestoDeTrabajo(codigo, model.CentroId, model.PuestoDeTrabajoId);
            if (documento == null) {
                ModelState.AddModelError("Imp", String.Format(Textos.Error_DocumentoDeImpresionNoEncontrado, codigo));
                return;
            }

            var resultadoImpresion = servicioComandos.Ejecutar(new ImprimirCartaPorteMesa
            {
                Dto = new ImpCartaPorteUrenportDto
                {
                    Impresora = documento.ImpresoraDireccion ?? "",
                    Codigo = codigo,
                    FechaImpresion = DateTime.Now,
                    WorkflowId = new Guid(),
                    Patente = "",
                    FotoRutaDestino = model.FotoRutaDestino,
                }
            });
            if (resultadoImpresion.HayErrores)
            {
                servicioComandos.Ejecutar(new EliminarCargaDeCupo { Id = resultado.Id });
                ModelState.AddModelError("Imp", Textos.ErrorImpresionCpMesa + resultadoImpresion.Errores.First().Value);
            }
        }

        private void ImprimirTarjetaDeAcceso(CargaDeCupoDto model, DatosUsuario datosUsuario, ResultadoCrear resultado)
        {
            if (!ModelState.IsValid) return;

            var resultadoImpresion = servicioComandos.Ejecutar(new ImprimirTarjetaDeAcceso
            {
                Dto = new ImpTarjetaDeAccesoDto
                {
                    Codigo = "ImpresionTarjetaDeAcceso",
                    Numero = model.Numero,
                    Fecha = DateTime.Now.Formatted(),
                    CentroId = datosUsuario.CentroId,
                    PuestoDeTrabajoId = model.PuestoDeTrabajoId
                }
            });
            if (resultadoImpresion.HayErrores)
            {
                servicioComandos.Ejecutar(new EliminarCargaDeCupo { Id = resultado.Id });
                ModelState.AddModelError("Imp", Textos.ErrorImpresionTarjetaDeAcceso);
            }
        }

        private void SetearVista(DatosUsuario datosUsuario)
        {
            var puestoDeTrabajo = servicio.ListarPuestosDeTrabajoPorNombrePc(datosUsuario.NombrePc, datosUsuario.CentroId).Where(x => x.PidePatente).FirstOrDefault();

            ViewBag.PuestoDeTrabajo = puestoDeTrabajo != null ? puestoDeTrabajo.ToJson() : null;
            ViewBag.CentroId = datosUsuario.CentroId;
        }

        [DatosUsuario]
        public JsonResult ValidarCupoEnSap(string cupo, DatosUsuario datosUsuario)
        {
            var model = new CargaDeCupoDto();

            ////model.MaterialId = 4;
            ////model.RespuestaSap = "hola";
            ////model.ProveedorDescripcion = "SUCESION DE RUEDA ALFREDO EDUARDO";
            ////model.ProveedorCuit = "20-00200069-6";
            ////model.MaterialDescripcion = "Semilla de Soja";
            ////model.FechaSap = "2019-01-29";
            ////model.Especial = false;
            ////model.Camara = "Fabrica";
            ////return Json(new { model }, JsonRequestBehavior.AllowGet);

            if (servicio.CupoConsumido(cupo, datosUsuario.CentroId))
            {
                return Json(new { error = Textos.CupoConsumido }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                try
                {
                    var codigosDeCentroSap = servicio.ObtenerCodigoDeCentroPorId(datosUsuario.CentroId);
                    log.Debug("ValidarCupoEnSap cupo: {0}, centro: {1}", cupo, string.Join(",", codigosDeCentroSap));
                    var esEspecial = false;
                    var response = servicioSap.Z_SDMF_RFC_Z2100(new Z_SDMF_RFC_Z2100Request
                    {
                        Z_SDMF_RFC_Z2100 = new Z_SDMF_RFC_Z2100()
                        {
                            IM_CENTRO = new ZMPES5210[] { new ZMPES5210 { CENTRO = codigosDeCentroSap[0] } },
                            IM_CODIGO = new ZMPES5200[] { new ZMPES5200 { CODIGO = cupo } }
                        }
                    });

                    var respuesta = response.Z_SDMF_RFC_Z2100Response.EX_CUPOS.FirstOrDefault();

                    if (respuesta != null && respuesta.MENSAJE == Textos.RespuestaSap_NoValido && codigosDeCentroSap.Length > 1)
                    {
                        response = servicioSap.Z_SDMF_RFC_Z2100(new Z_SDMF_RFC_Z2100Request
                        {
                            Z_SDMF_RFC_Z2100 = new Z_SDMF_RFC_Z2100()
                            {
                                IM_CENTRO = new ZMPES5210[] { new ZMPES5210 { CENTRO = codigosDeCentroSap[1] } },
                                IM_CODIGO = new ZMPES5200[] { new ZMPES5200 { CODIGO = cupo } }
                            }
                        });
                        respuesta = response.Z_SDMF_RFC_Z2100Response.EX_CUPOS.FirstOrDefault();
                        esEspecial = true;
                    }

                    if (respuesta != null && respuesta.MENSAJE != Textos.RespuestaSap_NoValido)
                    {
                        log.Debug("ValidarCupoEnSap Respuesta {0}: {1}", cupo, respuesta.ToXml());
                        var material = servicio.ObtenerMaterialIdYDescripcionPorCodigoSap(respuesta.MATERIAL.TrimStart(new[] { '0' }));
                        if (material.MaterialId == 0)
                        {
                            ModelState.AddModelError("Cupo", string.Format(Textos.Material_CodigoSAPNoExiste, respuesta.MATERIAL));
                            return Json(new { error = string.Format(Textos.Material_CodigoSAPNoExiste, respuesta.MATERIAL) }, JsonRequestBehavior.AllowGet);
                        }
                        model.MaterialId = material.MaterialId;
                        model.RespuestaSap = respuesta.MENSAJE;
                        model.ProveedorDescripcion = respuesta.DESCPROV;
                        model.ProveedorCuit = respuesta.CUIT;
                        model.MaterialDescripcion = material.Descripcion;
                        model.FechaSap = respuesta.FECHA;
                        model.Especial = esEspecial;
                        model.Camara = respuesta.CALIDAD;
                        return Json(new { model }, JsonRequestBehavior.AllowGet);
                    }
                    log.Debug("ValidarCupoEnSap Respuesta {0} no encontrado", cupo);
                    return Json(new { error = respuesta.MENSAJE }, JsonRequestBehavior.AllowGet);
                }
                catch (Exception e)
                {
                    log.Error(e, "Error al validar cupo en SAP: ");
                    return Json(new { error = Textos.Error_GenericoSap }, JsonRequestBehavior.AllowGet);
                }
            }
        }

        [DatosUsuario]
        public JsonResult ObtenerCupoCtg(string numeroCartaPorte, string workflow, DatosUsuario datosUsuario)
        {
            ////return Json(new { CartaPorte = new { NroCartaPorte = "444444444444", Cupo = "MOL3333/29012020", Patente = "TEST123", CTG = "11111111", TitularCartaPorteCodigoSap = "200069" }, CodigoDeError = "0", CodEstab = "1234" }, JsonRequestBehavior.AllowGet);
            try
            {
                log.Debug("Obteniendo CUPO por CP {0} workflow {1}", numeroCartaPorte, workflow);


                var cartaPorteResponse = servicioComandos.Ejecutar(new ConsultarCupoCTG { CentroId = datosUsuario.CentroId, NumeroCartaPorte = numeroCartaPorte, Usuario = datosUsuario.NombreUsuario }) as ResultadoDetalleCTG;
                log.Debug(cartaPorteResponse.HayErrores ? "Error al obtener Cupo CTG{0}: " + cartaPorteResponse.Errores.Values.First() : "Devolviendo Cupo por CP {0}", numeroCartaPorte);

                if (cartaPorteResponse.HayErrores)
                {
                    return Json(new { cartaPorteResponse.CartaPorte, CodigoDeError = cartaPorteResponse.HayErrores ? cartaPorteResponse.Errores.Keys.First() : "0", Error = cartaPorteResponse.Errores.Values.FirstOrDefault() }, JsonRequestBehavior.AllowGet);
                }

                var inhabilitacion = servicio.ListarInhabilitacionCamion(cartaPorteResponse.CartaPorte.Patente, datosUsuario.CentroId);
                if (inhabilitacion.Any())
                {
                    return Json(new { cartaPorteResponse.CartaPorte, CodigoDeError = "3", Error = inhabilitacion }, JsonRequestBehavior.AllowGet);
                }

                var validarCupo = servicio.ValidarCupo(cartaPorteResponse.CartaPorte.Cupo, datosUsuario.CentroId, cartaPorteResponse.CartaPorte.NroCartaPorte);
                if (validarCupo.Valido && validarCupo.YaAsignado)
                {
                    return Json(new { cartaPorteResponse.CartaPorte, CodigoDeError = "2", Error = "El cupo ya esta asignado a otra CP" }, JsonRequestBehavior.AllowGet);
                }
                return Json(new { cartaPorteResponse.CartaPorte, CodigoDeError = "0" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                log.Error(e, "No se pudo obtener el Cupo CP {0}", numeroCartaPorte);
                throw;
            }
        }

        [DatosUsuario]
        public JsonResult ObtenerFoto(string puestodetrabajoid, DatosUsuario datosUsuario, CargaDeCupoDto model, bool fotoPatente = true)
        {
            if (int.TryParse(puestodetrabajoid, out int n))
            {
                var puestoDeTrabajo = servicio.ObtenerPuestoDeTrabajo(int.Parse(puestodetrabajoid));

                if (puestoDeTrabajo.VideoCamaras != null && puestoDeTrabajo.VideoCamaras.Any())
                {
                    try
                    {
                        //Se asume que la primera cámara apunta al frente del camión y la última a la CP
                        var videocamara = fotoPatente ? puestoDeTrabajo.VideoCamaras.First() : puestoDeTrabajo.VideoCamaras.Last();
                        var resultadoEjecutar = servicioOrquestador.Ejecutar(new EjecutarTomarFoto
                        {
                            CodigoDispositivo = videocamara.Codigo
                        });

                        var resultado = resultadoEjecutar as ResultadoObtenerPatente;
                        var resultadoTomarFoto = resultadoEjecutar as ResultadoTomarFoto;
                        if (resultado != null)
                        {
                            if (!fotoPatente && model != null)
                            {
                                resultado.Imagen = DibujarEtiqueta(resultado.Imagen, model);
                            }
                            return Json(new
                            {
                                imagen = String.Format("data:image/jpg;base64,{0}", Convert.ToBase64String(resultado.Imagen)),
                                patente = resultado.Patente,
                                confianza = resultado.Confianza,
                                error = "",
                                directorio = videocamara.Directorio
                            }, JsonRequestBehavior.AllowGet);
                        }
                        if (resultadoTomarFoto != null)
                        {
                            if (!fotoPatente && model != null)
                            {
                                resultadoTomarFoto.Imagen = DibujarEtiqueta(resultadoTomarFoto.Imagen, model);
                            }
                            return Json(new
                            {
                                imagen = String.Format("data:image/jpg;base64,{0}", Convert.ToBase64String(resultadoTomarFoto.Imagen)),
                                error = "",
                                directorio = videocamara.Directorio

                            }, JsonRequestBehavior.AllowGet);
                        }
                    }
                    catch (Exception e)
                    {
                        return Json(new { error = "No se pudo obtener la imagen" }, JsonRequestBehavior.AllowGet);
                    }

                }
            }
            else
            {
                return Json(new { error = "No se pudo detectar correctamente el puesto de trabajo" }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { error = "No se pudo obtener la imagen" }, JsonRequestBehavior.AllowGet);
        }

        public byte[] DibujarEtiqueta(byte[] foto, CargaDeCupoDto model)
        {
            var etiqueta = $"Ingreso: {DateTime.Now.ToString("dd/MM/yyyy HH:mm")} Tarjeta: {model.Numero} CP: {model.NumeroCartaPorte}";
            var etiquetad = new Dictionary<string, string>
            {
                {"Ingreso: ", $"{DateTime.Now.ToString("dd/MM/yyyy HH:mm")}"},
                {"Tarjeta: ", $"{model.Numero}"},
                {"CP: ", $"{model.NumeroCartaPorte}"}
            };
            Bitmap imagenCP;
            using (var ms = new MemoryStream(foto))
            {
                imagenCP = new Bitmap(ms);
            }
            PointF posicionEtiqueta = new PointF(0, 0);

            using (Graphics graphics = Graphics.FromImage(imagenCP))
            {
                using (Font arialFontb = new Font("Arial", 25, FontStyle.Bold))
                {
                    using (Font arialFont = new Font("Arial", 25))
                    {
                        var sizeEtiqueta = graphics.MeasureString(etiqueta, arialFont);
                        var rect = new RectangleF(posicionEtiqueta.X, posicionEtiqueta.Y, sizeEtiqueta.Width, sizeEtiqueta.Height);
                        graphics.FillRectangle(Brushes.White, rect);

                        foreach (var k in etiquetad.Keys)
                        {
                            graphics.DrawString(k, arialFont, Brushes.Black, posicionEtiqueta);
                            posicionEtiqueta.X += graphics.MeasureString(k, arialFont).Width;
                            graphics.DrawString(etiquetad[k], arialFontb, Brushes.Black, posicionEtiqueta);
                            posicionEtiqueta.X += graphics.MeasureString(etiquetad[k], arialFontb).Width;
                        }
                    }
                }
            }
            var resultado = ImageToByte(imagenCP);
            imagenCP.Dispose();
            return resultado;
        }

        private static ImageCodecInfo GetEncoder(ImageFormat format)
        {
            ImageCodecInfo[] codecs = ImageCodecInfo.GetImageDecoders();
            foreach (ImageCodecInfo codec in codecs)
            {
                if (codec.FormatID == format.Guid)
                {
                    return codec;
                }
            }
            return null;
        }

        private static byte[] ImageToByte(Image img)
        {
            ImageCodecInfo jgpEncoder = GetEncoder(ImageFormat.Jpeg);
            System.Drawing.Imaging.Encoder myEncoder = System.Drawing.Imaging.Encoder.Quality;
            var myEncoderParameters = new EncoderParameters(1);
            myEncoderParameters.Param[0] = new EncoderParameter(myEncoder, 70L);
            using (var stream = new MemoryStream())
            {
                img.Save(stream, jgpEncoder, myEncoderParameters);
                return stream.ToArray();
            }
        }

        [HttpPost]
        [DatosUsuario]
        public ActionResult Eliminar(int id, DatosUsuario datosUsuario)
        {
            var resultado = servicioComandos.Ejecutar(new EliminarCargaDeCupo { Id = id, Usuario = datosUsuario.NombreUsuario });
            return Content(!resultado.HayErrores ? "true" : resultado.Errores.Values.First());
        }

    }
}
