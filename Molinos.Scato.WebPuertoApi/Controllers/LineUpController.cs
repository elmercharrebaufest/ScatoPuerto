using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using Molinos.Scato.WebPuertoApi.EXCEL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class LineUpController : BaseController
    {
        private readonly IServicioComandos servicioComandos;

        public LineUpController(
            IServicioRepositorio servicio,
            IServicioComandos servicioComandos) : base(servicio)
        {
            this.servicioComandos = servicioComandos;
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/LineUp/ResetearAgencia")]
        public HttpResponseMessage ResetearAgencia()
        {
            try
            {
                var embarques = servicio.ListarEmbarques();
                foreach (var embarque in embarques.Where(x => x.LineUp != null && x.LineUp.AgenciaContactada))
                {
                    embarque.LineUp.AgenciaContactada = false;
                    this.Modificar(embarque.LineUp);
                }
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUpLectura)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/LineUp/ObtenerEstadoPuerto")]
        public HttpResponseMessage ObtenerEstadoPuerto()
        {
            try
            {
                var estado = servicio.ObtenerEstadoPuerto();
                return Request.CreateResponse(HttpStatusCode.OK, estado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/LineUp/Modificar")]
        public HttpResponseMessage Modificar(LineUpDto lineUp)
        {
            try
            {
                Resultado res = null;
                if (lineUp.Ubicacion == 1)
                {
                    lineUp.PlanoDeCargaEnviado = true;
                    res = servicioComandos.Ejecutar(new EnvioMailZarpado { LineUpId = lineUp.Id });
                }
                var resultado = servicioComandos.Ejecutar(new ActualizarCartasLineUp { LineUp = lineUp }) as ResultadoCrear;
                if (resultado.HayErrores)
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, resultado.Mensaje);
                }
                if (res != null && res.HayErrores)
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, res.Errores[""]);
                }
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/LineUp/ModificarOrden")]
        public HttpResponseMessage ModificarOrden(Dictionary<int, int> idsYOrden)
        {
            try
            {
                servicioComandos.Ejecutar(new ModificarOrdenLineUp { IdsYOrden = idsYOrden });
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUpExportar)]
        [Autorizacion(PermisosScato.LineUp_Exportar)]
        [Route("api/LineUp/ExportarEmbarques")]
        public HttpResponseMessage ExportarEmbarques()
        {
            var docFile = "Line Up " + DateTime.Now.ToString("yyyy-MM-dd");
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);

            try
            {
                // var embarques = workflows.ListarEmbarques();
                var embarques = servicio.ListarEmbarques();
                embarques = embarques.Where(x => x.LineUp.Ocultar == false).ToList();
                var estado = servicio.ObtenerEstadoPuerto();
                var resultado = new ResultadoPrevisualizar();
                var generadorExcel = new ExcelLineUp();
                generadorExcel.GenerarArchivo(resultado, embarques, estado);

                response.Content = new ByteArrayContent(resultado.Archivo);
                response.Content.Headers.ContentLength = resultado.Archivo.LongLength;
            }
            catch (Exception e)
            {
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ReasonPhrase = string.Format("File not found: {0} .", docFile);
                throw new HttpResponseException(response);
            }
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
            response.Content.Headers.ContentDisposition.FileName = docFile + ".xls";
            response.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(docFile + ".xls"));
            return response;
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUpExportar)]
        [Autorizacion(PermisosScato.LineUp_Exportar)]
        [Route("api/LineUp/EnviarPorMail")]
        public void EnviarPorMail(MailDto mail)
        {
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
            var docFile = "Line Up " + DateTime.Now.ToString("yyyy-MM-dd") + ".xls";
            try
            {
                //var embarques = workflows.ListarEmbarques();
                var embarques = servicio.ListarEmbarques();
                embarques = embarques.Where(x => x.LineUp.Ocultar == false).ToList();
                var estado = servicio.ObtenerEstadoPuerto();
                var resultado = new ResultadoPrevisualizar();
                var generadorExcel = new ExcelLineUp();
                generadorExcel.GenerarArchivo(resultado, embarques, estado);

                if (!HttpContext.Current.Request.IsLocal)
                    mail.Destinatarios.Add("scatoprodMOA@molinosagro.com.ar");

                // CARACTERES NO IMPRIMIBLES:
                // Enter: (\n -> <br/>)
                // Tabulador: (\t -> &nbsp;&nbsp;&nbsp;&nbsp;)
                // Negrita: (\f -> <b>) (\f\f -> </b>)
                // Subrayado: (\0 -> <u>) (\0\0 -> </u>)
                servicioComandos.Ejecutar(new EnvioMail
                {
                    Cuerpo = mail.Body.Replace("\n", "<br/>").Replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;")
                        .Replace("\f\f", "</b>").Replace("\f", "<b>").Replace("\0\0", "</u>").Replace("\0", "<u>"),
                    Destinatarios = mail.Destinatarios,
                    Titulo = $"Line Up {DateTime.Now:dd-MM-yyyy HH:mm}",
                    Attachment = resultado.Archivo,
                    AttachmentName = docFile
                });
            }
            catch (Exception e)
            {
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ReasonPhrase = string.Format("File not found: {0} .", docFile);
                throw new HttpResponseException(response);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUpExportar)]
        [Autorizacion(PermisosScato.LineUp_Exportar)]
        [Route("api/LineUp/ObtenerDestinatariosLineUp")]
        public HttpResponseMessage ObtenerDestinatariosLineUp()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ObtenerUsuariosLineUp()
            );
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/LineUp/ModificarEstadosPuerto")]
        public HttpResponseMessage ModificarEstadosPuerto(EstadoPuertoDto estadoPuerto)
        {
            servicioComandos.Ejecutar(new CrearEstadoPuerto { Dto = estadoPuerto });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/LineUp/OcultarEmbarqueLineUp")]
        public HttpResponseMessage OcultarEmbarqueLineUp(int lineUpId)
        {
            try
            {
                servicio.OcultarEmbarqueLineUp(lineUpId);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/LineUp/RestaurarEmbarquesOcultosLineUp")]
        public HttpResponseMessage RestaurarEmbarquesOcultosLineUp()
        {
            try
            {
                servicio.RestaurarEmbarquesOcultosLineUp();
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }


    }
}