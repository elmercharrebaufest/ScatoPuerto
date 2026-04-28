using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Enumeradores;
using Molinos.Scato.Servicios.Procesamiento;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class PlanoDeCargaController : BaseController
    {
        private readonly IServicioComandos comandos;

        public PlanoDeCargaController(IServicioActividadFactory<IIngresarEmbarqueService> factory,
            IServicioRepositorio servicio, IServicioComandos comandos) : base(servicio)
        {
            this.comandos = comandos;
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/PlanoDeCarga/ListarDestinos")]
        public HttpResponseMessage ListarDestinos()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarTodosDestinos()
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/PlanoDeCarga/ListarAgenciasControlPrivado")]
        public HttpResponseMessage ListarAgenciasControlPrivado()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarAgenciasControlPrivado()
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/PlanoDeCarga/ListarAgentesControlPrivado")]
        public HttpResponseMessage ListarAgentesControlPrivado()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarAgentesControlPrivado()
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/PlanoDeCarga/ListarEstibas")]
        public HttpResponseMessage ListarEstibas()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarEstibas()
            );
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.PlanoDeCarga_Guardar)]
        [Route("api/PlanoDeCarga/GuardarPlanoDeCarga")]
        public HttpResponseMessage GuardarPlanoDeCarga(PlanoDeCargaDto planoDeCarga)
        {
            try
            {
                comandos.Ejecutar(new GuardarPlanoDeCarga { Dto = planoDeCarga, nombreUsuario = base.nombreUsuario });
                if (!string.IsNullOrEmpty(planoDeCarga.UsuarioFinalizacion))
                    servicio.EscribirLog($"El usuario {planoDeCarga.UsuarioFinalizacion} finaliza plano de carga con id: {planoDeCarga.Id}", TipoLog.Info, "PlanoDeCarga/GuardarPlanoDeCarga");
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                servicio.EscribirLog($"Hubo un error al intentar finalizar plano de carga con id: {planoDeCarga.Id}, intentó finalizar: {planoDeCarga.UsuarioFinalizacion}", TipoLog.Error, "PlanoDeCarga/GuardarPlanoDeCarga", ex.Message);
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/PlanoDeCarga/ListarExportadores")]
        public HttpResponseMessage ListarExportadores()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListaExportadores()
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/PlanoDeCarga/ListarExportadoresPorEmbarque")]
        public HttpResponseMessage ListarExportadoresPorEmbarque(int embarqueId)
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListaExportadoresPorEmbarque(embarqueId)
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/PlanoDeCarga/ListarDestinosPorEmbarque")]
        public HttpResponseMessage ListarDestinosPorEmbarque(int embarqueId)
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarDestinoPorEmbarque(embarqueId)
            );
        }

        [HttpGet]        
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/PlanoDeCarga/ListarBodegasTurno")]
        public HttpResponseMessage ListarBodegasTurno()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarBodegasTurnos()
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/PlanoDeCarga/ObtenerPlanoDeCarga")]
        public HttpResponseMessage ObtenerPlanoDeCarga(int id)
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ObtenerPlanoDeCarga(id)
            );
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.PlanoDeCarga_Estiba_Modificar)]
        [Route("api/PlanoDeCarga/AgregarEstiba")]
        public HttpResponseMessage AgregarEstiba(EstibaDto estiba)
        {
            comandos.Ejecutar(new CrearEstiba { Dto = estiba });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.PlanoDeCarga_Estiba_Modificar)]
        [Route("api/PlanoDeCarga/ModificarEstiba")]
        public HttpResponseMessage ModificarEstiba(EstibaDto estiba)
        {
            comandos.Ejecutar(new ModificarEstiba { Dto = estiba });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.PlanoDeCarga_Estiba_Modificar)]
        [Route("api/PlanoDeCarga/EliminarEstiba")]
        public HttpResponseMessage EliminarEstiba(int estibaId)
        {
            var resultado = comandos.Ejecutar(new EliminarEstiba { Id = estibaId });
            return Request.CreateResponse(!resultado.HayErrores ? true : false);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.PlanoDeCarga_AgenciaControlPrivado_Modificar)]
        [Route("api/PlanoDeCarga/AgregarAgenciaControlPrivado")]
        public HttpResponseMessage AgregarAgenciaControlPrivado(AgenciaControlPrivadoDto agencia)
        {
            comandos.Ejecutar(new CrearAgenciaControlPrivado { Dto = agencia });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.PlanoDeCarga_AgenciaControlPrivado_Modificar)]
        [Route("api/PlanoDeCarga/ModificarAgenciaControlPrivado")]
        public HttpResponseMessage ModificarAgenciaControlPrivado(AgenciaControlPrivadoDto agencia)
        {
            comandos.Ejecutar(new ModificarAgenciaControlPrivado { Dto = agencia });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.PlanoDeCarga_AgenciaControlPrivado_Modificar)]
        [Route("api/PlanoDeCarga/EliminarAgenciaControlPrivado")]
        public HttpResponseMessage EliminarAgenciaControlPrivado(int agenciaId)
        {
            var resultado = comandos.Ejecutar(new EliminarAgenciaControlPrivado { Id = agenciaId });
            return Request.CreateResponse(!resultado.HayErrores ? true : false);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.PlanoDeCarga_AgentesControlPrivado_Modificar)]
        [Route("api/PlanoDeCarga/AgregarAgenteControlPrivado")]
        public HttpResponseMessage AgregarAgenteControlPrivado(AgenteControlPrivadoDto agente)
        {
            comandos.Ejecutar(new CrearAgenteControlPrivado { Dto = agente });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.PlanoDeCarga_AgentesControlPrivado_Modificar)]
        [Route("api/PlanoDeCarga/ModificarAgenteControlPrivado")]
        public HttpResponseMessage ModificarAgenteControlPrivado(AgenteControlPrivadoDto agente)
        {
            comandos.Ejecutar(new ModificarAgenteControlPrivado { Dto = agente });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.PlanoDeCarga_AgentesControlPrivado_Modificar)]
        [Route("api/PlanoDeCarga/EliminarAgenteControlPrivado")]
        public HttpResponseMessage EliminarAgenteControlPrivado(int agenteId)
        {
            var resultado = comandos.Ejecutar(new EliminarAgenteControlPrivado { Id = agenteId });
            return Request.CreateResponse(!resultado.HayErrores ? true : false);
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUpExportar)]
        [Autorizacion(PermisosScato.LineUp_Exportar)]
        [Route("api/PlanoDeCarga/ObtenerDestinatariosPlanoDeCarga")]
        public HttpResponseMessage ObtenerDestinatariosPlanoDeCarga()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ObtenerUsuariosPlanoDeCarga()
            );
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUpExportar)]
        [Autorizacion(PermisosScato.LineUp_Exportar)]
        [Route("api/PlanoDeCarga/ObtenerBodyPlanoDeCarga")]
        public HttpResponseMessage ObtenerBodyPlanoDeCarga([FromUri] int planoDeCargaId, [FromBody] EmbarqueDto embarque)
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ObtenerBodyPlanoDeCarga(planoDeCargaId, embarque)
            );
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/PlanoDeCarga/obtenerPlanoDeCargaId")]
        public HttpResponseMessage obtenerPlanoDeCargaId(int idEmbarque)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.obtenerPlanoDeCargaId(idEmbarque));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUpExportar)]
        [Autorizacion(PermisosScato.LineUp_Exportar)]
        [Route("api/PlanoDeCarga/EnviarPorMail")]
        public void EnviarPorMail(int planoDeCargaId, MailDto mail)
        {
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
            try
            {
                var plano = servicio.ObtenerPlanoDeCarga(planoDeCargaId);
                var correoPuerto = servicio.ObtenerParamCorreo();

                mail.Destinatarios.Add(correoPuerto);

                if (mail.Destinatarios != null && mail.Destinatarios.Any())
                {
                    mail.Destinatarios.RemoveAll(item => item == null || item == "");
                }
                
                // CARACTERES NO IMPRIMIBLES:
                // Enter: (\n -> <br/>)
                // Tabulador: (\t -> &nbsp;&nbsp;&nbsp;&nbsp;)
                // Negrita: (\f -> <b>) (\f\f -> </b>)
                // Subrayado: (\0 -> <u>) (\0\0 -> </u>)
                if (mail.Adjunto == null)
                {
                    comandos.Ejecutar(new EnvioMail
                    {
                        Cuerpo = mail.Body.Replace("\n", "<br/>").Replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;")
                            .Replace("\f\f", "</b>").Replace("\f", "<b>").Replace("\0\0", "</u>").Replace("\0", "<u>"),
                        Destinatarios = mail.Destinatarios,
                        Titulo = mail.Titulo,
                        Attachment = plano.FilePathPlano == null ? null : Convert.FromBase64String(plano.FilePathPlano),
                        AttachmentName = plano.PlanoDeCargaArchivoPlanoNombre,

                        Attachment2 = plano.FilePathSecuencia == null ?
                            mail.Adjunto == null ? null : Convert.FromBase64String(mail.Adjunto) :
                            plano.FilePathSecuencia == null ? null : Convert.FromBase64String(plano.FilePathSecuencia),
                        AttachmentName2 = plano.FilePathSecuencia == null ?
                            mail.Nombre : plano.PlanoDeCargaArchivoSecuenciaNombre,

                        Attachment3 = plano.FilePathSecuencia == null ?
                            null : mail.Adjunto == null ? null : Convert.FromBase64String(mail.Adjunto),
                        AttachmentName3 = plano.FilePathSecuencia == null ? null : mail.Nombre
                    });
                }
                else
                {
                    comandos.Ejecutar(new EnvioMail
                    {
                        Cuerpo = mail.Body.Replace("\n", "<br/>").Replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;")
                            .Replace("\f\f", "</b>").Replace("\f", "<b>").Replace("\0\0", "</u>").Replace("\0", "<u>"),
                        Destinatarios = mail.Destinatarios,
                        Titulo = mail.Titulo,
                        Attachment = mail.Adjunto == null ? null : Convert.FromBase64String(mail.Adjunto),
                        AttachmentName = mail.Nombre
                    });
                }
                servicio.EscribirLog($"El usuario {base.nombreUsuario} envia plano de carga por correo.", TipoLog.Info, "PlanoDeCarga/EnviarPorMail");
            }
            catch (Exception e)
            {
                servicio.EscribirLog($"Hubo un error al intentar enviar plano de carga por correo. Ejecutado por: {base.nombreUsuario}", TipoLog.Error, "PlanoDeCarga/EnviarPorMail", e.Message);
                response.StatusCode = HttpStatusCode.InternalServerError;
                throw new HttpResponseException(response);
            }
        }

        [HttpPost]
        [Route("api/PlanoDeCarga/AgregarExportador")]
        public HttpResponseMessage AgregarExportador(ExportadorDto exportador)
        {
            comandos.Ejecutar(new CrearExportador { Dto = exportador });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        [Route("api/PlanoDeCarga/ModificarExportador")]
        public HttpResponseMessage ModificarExportador(ExportadorDto exportador)
        {
            comandos.Ejecutar(new ModificarExportador { Dto = exportador });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        [Route("api/PlanoDeCarga/EliminarExportador")]
        public HttpResponseMessage EliminarExportador(int exportadorId)
        {
            var resultado = comandos.Ejecutar(new EliminarExportador { Id = exportadorId });
            return Request.CreateResponse(!resultado.HayErrores ? true : false);
        }

        [HttpPost]
        [Route("api/PlanoDeCarga/ModificarCargadoPlanoDeCarga")]
        public HttpResponseMessage ModificarCargadoPlanoDeCarga(int planoDeCargaId)
        {
            comandos.Ejecutar(new ModificarCargadoPlanoDeCarga { Id = planoDeCargaId });
            Respuesta res = new Respuesta((int)HttpStatusCode.OK, "success");
            return Request.CreateResponse(HttpStatusCode.OK, res);
        }

        [HttpGet]
        [Route("api/PlanoDeCarga/ListarBalanzadaBuque")]
        public HttpResponseMessage ListarBalanzadaBuque(int buque, int ritmoBajaCarga)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarBalanzadaBuque(buque, ritmoBajaCarga));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }

        [HttpGet]
        [Route("api/PlanoDeCarga/BalanzadasBuque")]
        public HttpResponseMessage BalanzadasBuque(int IdModuloDeCarga)
        {
            try
            {
                var balanzadas = servicio.BalanzadasBuque(IdModuloDeCarga);
                return Request.CreateResponse(HttpStatusCode.OK, balanzadas);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }

        [HttpGet]
        [Route("api/PlanoDeCarga/listarCargaBalanza")]
        public HttpResponseMessage ListarCargaBalanzaPuerto()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                            servicio.ListarCargaBalanzaPuerto()
                        );
        }

        [HttpGet]
        [Route("api/PlanoDeCarga/listarBodegas")]
        public HttpResponseMessage ListarBodegas(int idPlanoDeCarga)
        {
            var response = Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarBodegasNir(idPlanoDeCarga)
                );
            return response;
        }

        [HttpGet]
        [Route("api/PlanoDeCarga/BodegasTienenCarga")]
        public HttpResponseMessage BodegasTienenCarga([FromUri] int moduloDeCargaId, [FromUri] string[] bodegas)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.BodegasTienenCarga(moduloDeCargaId, bodegas));
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }
        
    }
}