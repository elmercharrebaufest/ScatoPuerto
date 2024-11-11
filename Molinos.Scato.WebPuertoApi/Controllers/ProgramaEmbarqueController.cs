using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Productos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Destino;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using Molinos.Scato.WebPuertoApi.EXCEL;
using Molinos.Scato.WebPuertoApi.Helper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Permissions;
using System.Web;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class ProgramaEmbarqueController : BaseController
    {
        private readonly IServicioComandos comandos;
        private readonly IServicioRepositorio servicioRepositorio;

        public ProgramaEmbarqueController(IServicioRepositorio servicio,
            IServicioProgramaEmbarque servicioProgramaEmbarque,
            IServicioComandos comandos) : base(servicio, servicioProgramaEmbarque)
        {
            this.comandos = comandos;
            this.servicioRepositorio = servicio;
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarMuelleDeCarga")]
        public HttpResponseMessage ListarMuelleDeCarga()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarMuelleDeCarga());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUpExportar)]
        //[Autorizacion(PermisosScato.LineUp_Exportar)]
        [Route("api/ProgramaEmbarque/ObtenerDatosComboProgramaEmbarque")]
        public HttpResponseMessage ObtenerDatosComboProgramaEmbarque()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicioProgramaEmbarque.ListarDatosCombo()
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ProgramaEmbarque/ListarProgramaEmbarque")]
        public HttpResponseMessage ListarProgramaEmbarque(int? pagina = null, int? itemsPorPagina = null, DateTime? fecha = null, string muelle = null, string buque = null, string producto = null, bool? zarpo = null)
        {
            try
            {
                var paginacion = new Paginacion(null, DirOrden.Desc, (pagina == null) ? 0 : pagina.Value, (itemsPorPagina == 0 || !itemsPorPagina.HasValue) ? 10 : itemsPorPagina.Value);
                var response = servicioProgramaEmbarque.ListarProgramaDeEmbarque(paginacion, fecha,
                    (!string.IsNullOrEmpty(muelle) ? muelle.Split(',').ToList() : null),
                    (!string.IsNullOrEmpty(buque) ? buque.Split(',').ToList() : null),
                    (!string.IsNullOrEmpty(producto) ? producto.Split(',').ToList() : null), zarpo);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUpExportar)]
        //[Autorizacion(PermisosScato.LineUp_Exportar)]
        [Route("api/ProgramaEmbarque/ObtenerNominacion")]
        public HttpResponseMessage ObtenerNominacion(int id)
        {
            try
            {
                var nominacion = servicioProgramaEmbarque.ObtenerNominacion(id);
                return Request.CreateResponse(HttpStatusCode.OK,
                    nominacion
                );
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUpExportar)]
        //[Autorizacion(PermisosScato.LineUp_Exportar)]
        [Route("api/ProgramaEmbarque/ValidarCreacionNominacion")]
        public HttpResponseMessage ValidarCreacionNominacion(NominacionValidaDto nominacion)
        {
            try
            {
                bool validarCreacionNominacion = servicioProgramaEmbarque.ValidarCreacionNominacion(nominacion);
                return Request.CreateResponse(HttpStatusCode.OK, validarCreacionNominacion);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/ValidarPuedeCambiarBuque")]
        public HttpResponseMessage ValidarPuedeCambiarBuque(int id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.ValidarPuedeCambiarBuque(id));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarSurveyor")]
        public HttpResponseMessage ListarSurveyor()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarSurveyor());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarTasaDeCarga")]
        public HttpResponseMessage ListarTasaDeCarga()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarTasaDeCarga());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarTipoDeContrato")]
        public HttpResponseMessage ListarTipoDeContrato()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarTipoDeContrato());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarCalidadValor")]
        public HttpResponseMessage ListarCalidadValor()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarCalidadValor());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarTipoDeCalidad")]
        public HttpResponseMessage ListarTipoDeCalidad()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarTipoDeCalidad());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarVaporInformacion")]
        public HttpResponseMessage listarVaporInformacion()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.listarVaporInformacion());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarCombosDatoTecnico")]
        public HttpResponseMessage ListarCombosDatoTecnico()
        {
            try
            {
                var embarqueNominacionDatoTecnico = new ProgramaEmbarqueNominacionDatoTecnicoDto();
                embarqueNominacionDatoTecnico.MaterialPuerto = servicioProgramaEmbarque.listarMaterialPuerto();
                embarqueNominacionDatoTecnico.TipoDeCalidad = servicioProgramaEmbarque.listarTipoDeCalidad();
                embarqueNominacionDatoTecnico.Destino = servicioProgramaEmbarque.listarDestino();
                embarqueNominacionDatoTecnico.Exportador = servicioProgramaEmbarque.listarExportador();
                embarqueNominacionDatoTecnico.CoordinadorPuerto = servicioProgramaEmbarque.listarCoordinadorPuerto();
                embarqueNominacionDatoTecnico.VaporInformacion = servicioProgramaEmbarque.listarVaporInformacion();
                embarqueNominacionDatoTecnico.Bandera = servicioProgramaEmbarque.listarBandera();
                embarqueNominacionDatoTecnico.MuelleDeCarga = servicioProgramaEmbarque.listarMuelleDeCarga();
                embarqueNominacionDatoTecnico.TasaDeCarga = servicioProgramaEmbarque.listarTasaDeCarga();
                embarqueNominacionDatoTecnico.TipoDeContrato = servicioProgramaEmbarque.listarTipoDeContrato();
                embarqueNominacionDatoTecnico.ATAPuerto = servicioProgramaEmbarque.listarATAPuerto();
                embarqueNominacionDatoTecnico.AgenciaMaritimaPuerto = servicioProgramaEmbarque.listarAgenciaMaritimaPuerto();
                embarqueNominacionDatoTecnico.Surveyor = servicioProgramaEmbarque.listarSurveyor();
                embarqueNominacionDatoTecnico.CalidadValor = servicioProgramaEmbarque.listarCalidadValor();
                return Request.CreateResponse(HttpStatusCode.OK, embarqueNominacionDatoTecnico);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/RegistrarSurveyor")]
        public HttpResponseMessage RegistrarSurveyor(SurveyorDto surveyor)
        {
            try
            {
                bool bGraboOK = servicioProgramaEmbarque.CrearSurveyor(surveyor);
                return Request.CreateResponse(HttpStatusCode.OK, bGraboOK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/RegistrarTipoDeFumigacion")]
        public HttpResponseMessage RegistrarTipoDeFumigacion(TipoDeFumigacionDto tipoDeFumigacion)
        {
            try
            {
                bool bGraboOK = servicioProgramaEmbarque.CrearTipoDeFumigacion(tipoDeFumigacion);
                return Request.CreateResponse(HttpStatusCode.OK, bGraboOK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/RegistrarCompaniaDeFumigacion")]
        public HttpResponseMessage RegistrarCompaniaDeFumigacion(CompaniaDeFumigacionDto companiaDeFumigacion)
        {
            try
            {
                bool bGraboOK = servicioProgramaEmbarque.CrearCompaniaDeFumigacion(companiaDeFumigacion);
                return Request.CreateResponse(HttpStatusCode.OK, bGraboOK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/RegistrarNominacion")]
        public HttpResponseMessage RegistrarNominacion(NominacionDto nominacion)
        {
            try
            {
                Resultado resultado = new ResultadoCrear();
                bool bGraboOK = true;
                NominacionDto nominacionDto = servicioProgramaEmbarque.GuardarNominacion(nominacion);
                bGraboOK = nominacionDto.Id > 0 ? true : false;
                if (bGraboOK)
                {
                    #region Registro de dato tecnico

                    nominacion.Id = nominacionDto.Id;
                    resultado = comandos.Ejecutar(new GuardarNominacionDatoTecnico
                    {
                        Dto = nominacion,
                        EsCreacion = nominacion.NominacionDatoTecnico.Id > 0 ? false : true,
                    });

                    #endregion Registro de dato tecnico

                    #region Registro de recibos

                    if (nominacion.NominacionRecibo != null && nominacion.NominacionRecibo.Count > 0)
                    {
                        var listaNominacionRecibo = (List<NominacionReciboDto>)nominacion.NominacionRecibo;
                        servicioProgramaEmbarque.GuardarNominacionRecibo(listaNominacionRecibo, nominacion.Id);
                    }

                    #endregion Registro de recibos

                    #region Registro de intervencion

                    resultado = comandos.Ejecutar(new GuardarNominacionDetalleIntervencion
                    {
                        Dto = nominacion.NominacionDetalleIntervencion,
                        nominacion_id = nominacion.Id
                    });

                    #endregion Registro de intervencion

                    #region Configuracion de documentos

                    resultado = comandos.Ejecutar(new GuardarConfiguracionDocumento
                    {
                        Configuraciones = nominacion.ConfiguracionDocumentos,
                        NominacionId = nominacion.Id,
                        Usuario = this.nombreUsuario
                    });

                    #endregion Configuracion de documentos
                }
                return Request.CreateResponse(HttpStatusCode.OK, bGraboOK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/RegistrarNominacionDatoTecnico")]
        public HttpResponseMessage RegistrarNominacionDatoTecnico(NominacionDto nominacion)
        {
            try
            {
                Resultado resultado = new Resultado();
                bool bGraboOK = true;
                resultado = comandos.Ejecutar(new GuardarNominacionDatoTecnico
                {
                    Dto = nominacion,
                    EsCreacion = nominacion.NominacionDatoTecnico.Id == 0
                });
                bGraboOK = resultado.HayErrores ? false : true;
                return Request.CreateResponse(HttpStatusCode.OK, bGraboOK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/RegistrarNominacionDetalleIntervencion")]
        public HttpResponseMessage RegistrarNominacionDetalleIntervencion(NominacionDetalleIntervencionDto nominacionDetalleIntervencion, int nominacion_id)
        {
            try
            {
                Resultado resultado = new Resultado();
                bool bGraboOK = true;
                resultado = comandos.Ejecutar(new GuardarNominacionDetalleIntervencion
                {
                    Dto = nominacionDetalleIntervencion,
                    nominacion_id = nominacion_id
                });
                bGraboOK = resultado.HayErrores ? false : true;
                return Request.CreateResponse(HttpStatusCode.OK, bGraboOK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/ObtenerNominacionRecibos")]
        public HttpResponseMessage ObtenerNominacionRecibos(int nominacion_id)
        {
            try
            {
                var nominacion = servicioProgramaEmbarque.ObtenerNominacionRecibos(nominacion_id);
                return Request.CreateResponse(HttpStatusCode.OK,
                    nominacion
                );
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/RegistrarNominacionRecibo")]
        public HttpResponseMessage GuardarNominacionRecibo(int nominacion_id, List<NominacionReciboDto> nominacionRecibo)
        {
            try
            {
                servicioProgramaEmbarque.GuardarNominacionRecibo(nominacionRecibo, nominacion_id);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/EliminarNominacion")]
        public HttpResponseMessage EliminarNominacion(int nominacion_id)
        {
            try
            {
                servicioProgramaEmbarque.EliminarNominacion(nominacion_id);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarCompaniaDeFumigacion")]
        public HttpResponseMessage listarCompaniaDeFumigacion()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.ListarCompaniaDeFumigacion());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarTipoDeFumigacion")]
        public HttpResponseMessage listarTipoDeFumigacion()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.ListarTipoDeFumigacion());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarBuquesNominacion")]
        public HttpResponseMessage ListarBuquesNominacion()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.ListarBuquesNominacion());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/EliminarNotificacion")]
        public HttpResponseMessage eliminarNotificacion(NotificacionProgramaDeEmbarqueDto notificacion)
        {
            try
            {
                servicioProgramaEmbarque.EliminarNotificacion(notificacion.Id, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/ProgramaEmbarque/EnviarMailProgramaEmbarque")]
        public HttpResponseMessage EnviarMailProgramaEmbarque(MailDto mail)
        {
            try
            {
                servicioProgramaEmbarque.ActualizarDatosYEnviarMail(mail);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/ObtenerDatosMailProgramaEmbarque")]
        public HttpResponseMessage ObtenerDatosMailProgramaEmbarque(int nominacionId, string tipoDeMail)
        {
            try
            {
                var notificacion = new NotificacionProgramaEmbarque();
                var nominacionDto = servicioProgramaEmbarque.ObtenerNominacion(nominacionId);
                var mailProgramacionEmbarque = servicioProgramaEmbarque.ObtenerDatosMailProgramaEmbarque(nominacionDto, tipoDeMail);
                mailProgramacionEmbarque.Body = notificacion.GenerarCuerpoEmail(nominacionDto);
                return Request.CreateResponse(HttpStatusCode.OK, mailProgramacionEmbarque);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ObtenerNotificaciones")]
        public HttpResponseMessage ObtenerNotificaciones()
        {
            try
            {
                var response = Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.ObtenerNotificaciones(base.nombreUsuario));
                return response;
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ObtenerAuditoria")]
        public HttpResponseMessage ObtenerAuditoria(int nominacion_id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.ObtenerAuditoria(nominacion_id));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ListarNominacionPorBuque")]
        public HttpResponseMessage ListarNominacionPorBuque(int vaporInformacion_Id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.ListarNominacionPorBuque(vaporInformacion_Id));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/TieneAuditoria")]
        public HttpResponseMessage TieneAuditoria([FromBody] int[] nominaciones_id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.TieneAuditoria(nominaciones_id));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.PreLineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/EnviarNominacionLineUp")]
        public HttpResponseMessage EnviarNominacionLineUp(ProgramaEmbarqueNominacionesEnvioLineUpDto nominacionesEnvioLineUpDto)
        {
            var workflow = ConfigurationManager.AppSettings["Workflow"];
            var centro = int.Parse(ConfigurationManager.AppSettings["Centro"]);
            ResultadoEnvioLineUpDto programaEmbarqueResultadoEnvioLineUp = new ResultadoEnvioLineUpDto();
            programaEmbarqueResultadoEnvioLineUp.ResultadoEnvioLineUp = new List<RespuestaEnvioLineUpDto>();
            try
            {
                foreach (var programaEmbarqueNominacion in nominacionesEnvioLineUpDto.ListaNominaciones)
                {
                    var nominacion = servicioProgramaEmbarque.ObtenerNominacion(programaEmbarqueNominacion.Nominacion_Id);

                    var validacionEmbarques = servicioProgramaEmbarque.ObtenerEmbarque(nominacion.NominacionDatoTecnico.MaterialPuerto.Id,
                                                                             nominacion.NominacionDatoTecnico.MuelleDeCarga.Id,
                                                                             nominacion.NominacionDatoTecnico.VaporInformacion.Vapor.Id);

                    if (validacionEmbarques.ProgramaEmbarqueEmbarqueMaterial == null) // Nuevo Embarque
                    {
                        this.CrearAltaDeEmbarque(nominacion, centro, workflow, ref programaEmbarqueResultadoEnvioLineUp);
                    }
                    else
                    {
                        int embarque_Id = validacionEmbarques.ProgramaEmbarqueEmbarqueMaterial.Embarque.Id;
                        bool existeMaterial = validacionEmbarques.ProgramaEmbarqueEmbarqueMaterial.MaterialesExistentes.Existe;

                        if (validacionEmbarques.ProgramaEmbarqueEmbarqueMaterial.Embarque.Ubicacion == 2)
                        {
                            servicioProgramaEmbarque.AsociarEmbarquePorNominacionEnviada(nominacion.Id, embarque_Id, MensajeEnvioLineUp.ENVIO_MUELLE_CARGA);
                            programaEmbarqueResultadoEnvioLineUp.ResultadoEnvioLineUp.Add(new RespuestaEnvioLineUpDto()
                            {
                                Nominacion_Id = nominacion.Id,
                                Estado = 2,
                                Observacion = MensajeEnvioLineUp.ENVIO_MUELLE_CARGA
                            });
                        }
                        else
                        {
                            if (embarque_Id > 0 && !existeMaterial)
                            {
                                this.ModificarAltaDeEmbarque(nominacion, validacionEmbarques, ref programaEmbarqueResultadoEnvioLineUp);
                            }
                            else
                            {
                                servicioProgramaEmbarque.AsociarEmbarquePorNominacionEnviada(nominacion.Id, embarque_Id, MensajeEnvioLineUp.ENVIO_PRODUCTO_EXISTENTE);
                                programaEmbarqueResultadoEnvioLineUp.ResultadoEnvioLineUp.Add(new RespuestaEnvioLineUpDto()
                                {
                                    Nominacion_Id = nominacion.Id,
                                    Estado = 2,
                                    Observacion = MensajeEnvioLineUp.ENVIO_PRODUCTO_EXISTENTE
                                });
                            }
                        }
                    }
                }
                return Request.CreateResponse(HttpStatusCode.OK, programaEmbarqueResultadoEnvioLineUp);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/EnviarNominacionesExcel")]
        public HttpResponseMessage EnviarNominacionesExcel()
        {
            try
            {
                var nominaciones = servicioProgramaEmbarque.ListarNominacionesExcel();
                var excel = new ExcelProgramaEmbarque(nominaciones).GenerarArchivo();
                servicioProgramaEmbarque.EnviarMailNominacionesExcel(excel);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        #region Agencias Maritimas y ATA

        [HttpGet]
        [Route("api/ProgramaEmbarque/ListarComboATA")]
        public HttpResponseMessage ListarComboATA()
        {
            try
            {
                var atas = servicioProgramaEmbarque.listarATAPuerto(true);
                return Request.CreateResponse(HttpStatusCode.OK, atas);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/ListarAgenciasATA")]
        public HttpResponseMessage ListarAgenciasATA(int pagina = 1, int itemsPorPagina = 10, string nombre = null, string cuit = null, int tipo = 0)
        {
            try
            {
                var paginacion = new Paginacion(null, DirOrden.Asc, pagina, itemsPorPagina == 0 ? 10 : itemsPorPagina);
                var listaPaginada = servicioProgramaEmbarque.ListarAgenciasATA(paginacion, nombre, cuit, tipo);
                var response = new { listaPaginada.Items, listaPaginada.ItemsTotales };
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/ListarAgenciasATASinPaginar")]
        public HttpResponseMessage ListarAgenciasATASinPaginar(string nombre = null, string cuit = null, int tipo = 0)
        {
            try
            {
                var listado = servicioProgramaEmbarque.ListarAgenciasATASinPaginar(nombre, cuit, tipo);
                return Request.CreateResponse(HttpStatusCode.OK, listado);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/ObtenerAgenciaMaritima")]
        public HttpResponseMessage ObtenerAgenciaMaritima(int id)
        {
            try
            {
                var agencia = servicioProgramaEmbarque.ObtenerAgenciaMaritimaPuerto(id);
                return Request.CreateResponse(HttpStatusCode.OK, agencia);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/ObtenerATA")]
        public HttpResponseMessage ObtenerATA(int id)
        {
            try
            {
                var ata = servicioProgramaEmbarque.ObtenerATAPuerto(id);
                return Request.CreateResponse(HttpStatusCode.OK, ata);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/ProgramaEmbarque/CrearAgenciaMaritimaATA")]
        public HttpResponseMessage CrearAgenciaMaritimaATA(CrearAgenciaMaritimaATADto agenciaATA)
        {
            if (!ModelState.IsValid)
            {
                var errores = string.Join("\n", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).Distinct());
                return Request.CreateResponse(HttpStatusCode.BadRequest, errores);
            }
            try
            {
                servicioProgramaEmbarque.CrearAgenciaMaritimaATA(agenciaATA, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPut]
        [Route("api/ProgramaEmbarque/ModificarAgenciaMaritimaATA")]
        public HttpResponseMessage ModificarAgenciaMaritimaATA(ModificarAgenciaMaritimaATADto agenciaMaritimaATA)
        {
            if (!ModelState.IsValid)
            {
                var errores = string.Join("\n", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).Distinct());
                return Request.CreateResponse(HttpStatusCode.BadRequest, errores);
            }
            try
            {
                servicioProgramaEmbarque.ModificarAgenciaMaritimaATA(agenciaMaritimaATA, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpDelete]
        [Route("api/ProgramaEmbarque/EliminarAgenciaMaritimaATA")]
        public HttpResponseMessage EliminarAgenciaMaritimaATA(int id, int tipo)
        {
            try
            {
                servicioProgramaEmbarque.EliminarAgenciaMaritimaATA(id, tipo, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        #endregion Agencias Maritimas y ATA

        #region Destinos

        [HttpGet]
        [Route("api/ProgramaEmbarque/ListarDestinos")]
        public HttpResponseMessage ListarDestinos(int pagina = 1, int itemsPorPagina = 10, string nombre = null)
        {
            try
            {
                var listaPaginada = servicioProgramaEmbarque.ListarDestinos(nombre, pagina, itemsPorPagina);
                var response = new { listaPaginada.Items, listaPaginada.ItemsTotales };
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/ListarDestinosSinPaginar")]
        public HttpResponseMessage ListarDestinosSinPaginar(string nombre = null)
        {
            try
            {
                var destinos = servicioProgramaEmbarque.ListarDestinos(nombre);
                return Request.CreateResponse(HttpStatusCode.OK, destinos.Items);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/ProgramaEmbarque/CrearDestino")]
        public HttpResponseMessage CrearDestino(AltaEdicionDestinoDto destino)
        {
            try
            {
                servicioProgramaEmbarque.CrearDestino(destino, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPut]
        [Route("api/ProgramaEmbarque/ModificarDestino")]
        public HttpResponseMessage EditarDestino(AltaEdicionDestinoDto destino)
        {
            try
            {
                servicioProgramaEmbarque.ModificarDestino(destino, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpDelete]
        [Route("api/ProgramaEmbarque/EliminarDestino")]
        public HttpResponseMessage EliminarDestino(int id)
        {
            try
            {
                servicioProgramaEmbarque.EliminarDestino(id, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        #endregion Destinos

        private EmbarqueDto CrearEmbarqueDto(NominacionDto nominacion, int centroId)
        {
            EmbarqueDto embarqueDto = new EmbarqueDto();
            embarqueDto.Id = 0;
            embarqueDto.NombreBuque = nominacion.NominacionDatoTecnico.VaporInformacion.NombreBuque;
            IList<TipoDeBuquePuertoDto> tipoDeBuquePuerto = servicioRepositorio.ListarTipoDeBuquePuerto();
            var filtroTipoDeBuque = tipoDeBuquePuerto.Where(x => x.Nombre == nominacion.NominacionDatoTecnico.VaporInformacion.TipoBuque);
            embarqueDto.TipoBuque = nominacion.NominacionDatoTecnico.VaporInformacion.TipoBuque;
            if (filtroTipoDeBuque != null)
                embarqueDto.TipoDeBuque = filtroTipoDeBuque.ElementAt(0);
            embarqueDto.Agencias = nominacion.NominacionDatoTecnico.AgenciaMaritimaPuerto;
            embarqueDto.FechaRecalada = nominacion.NominacionDatoTecnico.ETARecalada;
            DateTime etaRecalada = (DateTime)nominacion.NominacionDatoTecnico.ETARecalada;
            embarqueDto.HoraRecalada = etaRecalada != null ? etaRecalada.ToString("HH:mm") : "";
            embarqueDto.ObligacionCarga = nominacion.NominacionDatoTecnico.ObligacionDeCarga;
            IList<MaterialPuertoCantidadDto> listaMaterialesPuertoCantidad = new List<MaterialPuertoCantidadDto>();
            MaterialPuertoCantidadDto materialPuertoCantidad = new MaterialPuertoCantidadDto()
            {
                Cantidad = (int)nominacion.NominacionDatoTecnico.CantidadTotal,
                DescripcionCorta = nominacion.NominacionDatoTecnico.MaterialPuerto.DescripcionCorta,
                Color = nominacion.NominacionDatoTecnico.MaterialPuerto.Color,
                MaterialId = nominacion.NominacionDatoTecnico.MaterialPuerto.Id,
                EsLiquido = nominacion.NominacionDatoTecnico.MaterialPuerto.EsLiquido
            };
            listaMaterialesPuertoCantidad.Add(materialPuertoCantidad);
            embarqueDto.MaterialesPuertoCantidad = listaMaterialesPuertoCantidad;
            if (nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto.Count > 0)
            {
                var nominacionDatoTecnicoCoordinadorPuerto = nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto;
                embarqueDto.Coordinadores = nominacionDatoTecnicoCoordinadorPuerto.Select(
                    coo => new EmbarqueCoordinadorDto
                    {
                        CoordinadorPuerto = coo.CoordinadorPuerto
                    }).ToList();
            }
            embarqueDto.Agencias = nominacion.NominacionDatoTecnico.AgenciaMaritimaPuerto;
            embarqueDto.CentroId = centroId;
            embarqueDto.Patente = nominacion.NominacionDatoTecnico.VaporInformacion.NombreBuque;
            MuelleDeCargaDto muelleDeCarga = nominacion.NominacionDatoTecnico.MuelleDeCarga;
            bool vicentin = muelleDeCarga.Descripcion == "Vicentin" ? true : false;
            bool noryon = muelleDeCarga.Descripcion == "Nouryon" ? true : false;
            bool sanBenito = muelleDeCarga.Descripcion == "San Benito" ? true : false;
            bool otrosMuelles = muelleDeCarga.Descripcion == "Otros Muelles" ? true : false;
            embarqueDto.Vicentin = vicentin;
            embarqueDto.OtrosMuelles = otrosMuelles;
            embarqueDto.Noryon = noryon;
            embarqueDto.SanBenito = sanBenito;
            embarqueDto.Ubicacion = 8;
            IList<UbicacionDeBuquePuertoDto> ubicacionDeBuquePuertoDto = servicioRepositorio.ListarUbicacionDeBuquePuerto();
            var filtroUbicacionDeBuquePuerto = ubicacionDeBuquePuertoDto.Where(x => x.Orden == 8);
            embarqueDto.UbicacionDeBuque = filtroUbicacionDeBuquePuerto.ElementAt(0);

            embarqueDto.Senasa = false;
            embarqueDto.Freeboard = 0;
            embarqueDto.PorteNeto = 0;
            embarqueDto.PorteBruto = 0;
            embarqueDto.Eslora = 0;
            embarqueDto.Manga = 0;
            embarqueDto.Puntal = 0;

            if (nominacion.NominacionDetalleIntervencion != null && nominacion.NominacionDetalleIntervencion.Senasa.Count > 0)
            {
                var senasa = nominacion.NominacionDetalleIntervencion.Senasa.ElementAt(0);
                embarqueDto.Senasa = senasa.TieneSenasa;
            }

            embarqueDto.CantidadBodegasTanques = 0;
            embarqueDto.Destino = null;
            embarqueDto.ATA = nominacion.NominacionDatoTecnico.ATAPuerto;
            embarqueDto.EsLiquido = nominacion.NominacionDatoTecnico.MaterialPuerto.EsLiquido;
            embarqueDto.Vapor = nominacion.NominacionDatoTecnico.VaporInformacion.Vapor;
            embarqueDto.EmbarqueInformacion = null;
            embarqueDto.EmbarqueInformacionViaje = null;
            embarqueDto.EmbarquePosicion = null;
            IList<EmbarqueDto> listaEmbarqueDto = servicioProgramaEmbarque.ObtenerEmbarquePorVapor(nominacion.NominacionDatoTecnico.MaterialPuerto.Id,
                                                                                                   nominacion.NominacionDatoTecnico.MuelleDeCarga.Id,
                                                                                                   nominacion.NominacionDatoTecnico.VaporInformacion.Vapor.Id);
            string observaciones = string.Empty;
            observaciones += $"Destinos: {Environment.NewLine}";

            foreach (var destino in nominacion.NominacionDatoTecnico.NominacionDatoTecnicoDestino)
            {
                observaciones += $"{destino.Destino.Nombre.Trim()} / {FormatearObservacionesTn(destino.Cantidad)} tn {Environment.NewLine}";
            }

            observaciones += $"{Environment.NewLine} {Environment.NewLine}";

            observaciones += $"Cargadores: {Environment.NewLine}";

            foreach (var exportador in nominacion.NominacionDatoTecnico.NominacionDatoTecnicoExportador)
            {
                observaciones += $"{exportador.Exportador.Nombre.Trim()} / {FormatearObservacionesTn(exportador.Cantidad)} tn {Environment.NewLine}";
            }

            embarqueDto.Observaciones = observaciones;
            if (listaEmbarqueDto != null && listaEmbarqueDto.Count > 0)
            {
                var embarqueDtoSel = listaEmbarqueDto[0];
                if (embarqueDtoSel.EmbarqueInformacion.Count > 0)
                {
                    embarqueDto.EmbarqueInformacion = embarqueDtoSel.EmbarqueInformacion;
                    embarqueDto.EmbarqueInformacionViaje = embarqueDtoSel.EmbarqueInformacionViaje;
                    embarqueDto.EmbarquePosicion = embarqueDtoSel.EmbarquePosicion;
                }
                else
                {
                    EmbarqueInformacionDto embarqueInformacionDto = this.CrearEmbarqueInformacion(nominacion.NominacionDatoTecnico);
                    embarqueDto.EmbarqueInformacion.Add(embarqueInformacionDto);
                    embarqueDto.EmbarqueInformacionViaje = null;
                    embarqueDto.EmbarquePosicion = null;
                }
            }
            else
            {
                EmbarqueInformacionDto embarqueInformacionDto = this.CrearEmbarqueInformacion(nominacion.NominacionDatoTecnico);
                IList<EmbarqueInformacionDto> listEmbarqueInformacionDto = new List<EmbarqueInformacionDto>();
                listEmbarqueInformacionDto.Add(embarqueInformacionDto);
                embarqueDto.EmbarqueInformacion = listEmbarqueInformacionDto;
            }
            return embarqueDto;
        }

        private string FormatearObservacionesTn(decimal valor)
        {
            return valor.ToString(valor % 1 == 0 ? "0" : "0.###");
        }

        private EmbarqueInformacionDto CrearEmbarqueInformacion(NominacionDatoTecnicoDto nominacionDatoTecnico)
        {
            EmbarqueInformacionDto embarqueInformacionDto = new EmbarqueInformacionDto();
            embarqueInformacionDto.Id = 0;
            embarqueInformacionDto.IMO = nominacionDatoTecnico.VaporInformacion.ImoVapor;
            embarqueInformacionDto.MMSI = "";
            embarqueInformacionDto.Bandera = nominacionDatoTecnico.VaporInformacion.Bandera;
            embarqueInformacionDto.Tonelaje = 0;
            embarqueInformacionDto.TonelajePesoMuerto = 0;
            embarqueInformacionDto.LargoxAnchoExtremo = $"{nominacionDatoTecnico.VaporInformacion.Eslora} x {nominacionDatoTecnico.VaporInformacion.Manga}";
            embarqueInformacionDto.FotoEmbarque = null;
            embarqueInformacionDto.FechaRegistro = DateTime.Now;
            return embarqueInformacionDto;
        }

        private bool CrearAltaDeEmbarque(NominacionDto nominacion, int centro, string workflow, ref ResultadoEnvioLineUpDto programaEmbarqueResultadoEnvioLineUp)
        {
            bool bCreacionEmbarque = false;
            int datosEmbarque = 0;
            try
            {
                EmbarqueDto embarqueDto = this.CrearEmbarqueDto(nominacion, centro);
                servicioProgramaEmbarque.ProcesarNotificacion(Servicios.Impl.ServicioProgramaEmbarque.TipoNotificacion.Agregar, null, embarqueDto);
                var workflowDefinicionId = servicio.ObtenerUltimaWorkflowDefinicionPorCordigo(workflow);

                var controlRecorrido = new ControlRecorridoDto
                {
                    Actividad = Textos.ActIngresarEmbarque,
                    ActividadXaml = "IngresarEmbarque",
                    NombreUsuario = nombreUsuario
                };

                var result = (ResultadoCrear)comandos.Ejecutar(new CrearEmbarque { Embarque = embarqueDto });

                datosEmbarque = result.Id;
                servicio.ActualizarEstadoBuque(datosEmbarque, 1);
                servicioProgramaEmbarque.AsociarEmbarquePorNominacionEnviada(nominacion.Id, datosEmbarque, MensajeEnvioLineUp.ENVIO_OK);
                bCreacionEmbarque = datosEmbarque > 0 ? true : false;
                programaEmbarqueResultadoEnvioLineUp.ResultadoEnvioLineUp.Add(new RespuestaEnvioLineUpDto()
                {
                    Nominacion_Id = nominacion.Id,
                    Estado = 1,
                    Observacion = MensajeEnvioLineUp.ENVIO_OK
                });
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return bCreacionEmbarque;
        }

        private bool ModificarAltaDeEmbarque(NominacionDto nominacion, ProgramaEmbarqueValidacionLineUpDto programaEmbarqueValidacionLineUp, ref ResultadoEnvioLineUpDto programaEmbarqueResultadoEnvioLineUp)
        {
            bool bModificacionEmbarque = false;
            try
            {
                EmbarqueDto embarque = programaEmbarqueValidacionLineUp.ProgramaEmbarqueEmbarqueMaterial.Embarque;
                servicioProgramaEmbarque.AgregarMaterialesPorNominacionEnviada(nominacion.Id, embarque.Id);
                servicioProgramaEmbarque.AsociarEmbarquePorNominacionEnviada(nominacion.Id, embarque.Id, MensajeEnvioLineUp.ENVIO_PRODUCTO_AGREGADO);
                servicioProgramaEmbarque.ProcesarNotificacion(Servicios.Impl.ServicioProgramaEmbarque.TipoNotificacion.Modificar, null, embarque, nominacion);
                bModificacionEmbarque = true;
                programaEmbarqueResultadoEnvioLineUp.ResultadoEnvioLineUp.Add(new RespuestaEnvioLineUpDto()
                {
                    Nominacion_Id = nominacion.Id,
                    Estado = 1,
                    Observacion = MensajeEnvioLineUp.ENVIO_PRODUCTO_AGREGADO
                });
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return bModificacionEmbarque;
        }

        #region ABM Exportadores

        [HttpGet]
        [Route("api/ProgramaEmbarque/ListarExportadores")]
        public HttpResponseMessage ListarExportadores(int pagina = 1, int itemsPorPagina = 10, string nombre = null)
        {
            try
            {
                var paginacion = new Paginacion(null, DirOrden.Asc, pagina, itemsPorPagina == 0 ? 10 : itemsPorPagina);
                var listaPaginada = servicioProgramaEmbarque.ListarExportadoresPaginado(paginacion, nombre);
                var response = new { listaPaginada.Items, listaPaginada.ItemsTotales, listaPaginada.ItemsPorPagina, listaPaginada.Pagina };
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/ExcelExportadores")]
        public HttpResponseMessage ExportarExcelExportadores(string nombre)
        {
            try
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                var listado = servicioProgramaEmbarque.ListarExportadores(nombre);
                var excel = new ExcelExportadores(listado).GenerarExcel();
                response.Content = new ByteArrayContent(excel);
                response.Content.Headers.ContentLength = excel.LongLength;
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                response.Content.Headers.ContentDisposition.FileName = "listado_exportadores" + ".xls";
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping("listado_exportadores.xls"));
                return response;
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        [HttpPost]
        [Route("api/ProgramaEmbarque/CrearExportador")]
        public HttpResponseMessage CrearExportador(ExportadorDto exportador)
        {
            try
            {
                servicioProgramaEmbarque.CrearExportador(exportador, base.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/ObtenerExportador")]
        public HttpResponseMessage ObtenerExportador(int id)
        {
            try
            {
                var exportador = servicioProgramaEmbarque.ObtenerExportador(id);
                return Request.CreateResponse(HttpStatusCode.OK, exportador);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPut]
        [Route("api/ProgramaEmbarque/EditarExportador")]
        public HttpResponseMessage EditarExportador(ExportadorDto exportador)
        {
            try
            {
                servicioProgramaEmbarque.EditarExportador(exportador, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpDelete]
        [Route("api/ProgramaEmbarque/EliminarExportador")]
        public HttpResponseMessage EliminarExportador(int id)
        {
            try
            {
                servicioProgramaEmbarque.EliminarExportador(id, this.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        #endregion ABM Exportadores

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/CrearNominacionEmbarqueFAS")]
        public HttpResponseMessage CrearNominacionEmbarqueFAS(AltaEmbarqueFASDto altaEmbarqueFAS)
        {
            try
            {
                var embarque = altaEmbarqueFAS.Embarque;
                embarque.CentroId = int.Parse(ConfigurationManager.AppSettings["Centro"]);
                embarque.Patente = embarque.NombreBuque;
                var result = (ResultadoCrear)comandos.Ejecutar(new CrearEmbarque { Embarque = embarque });
                servicioProgramaEmbarque.CrearNominacionFAS(result.Id, altaEmbarqueFAS.Recibos);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        #region ABM Producto

        [HttpGet]
        [Route("api/ProgramaEmbarque/ListarProductos")]
        public HttpResponseMessage ListarProductos(int pagina = 1, int itemsPorPagina = 10, string nombre = null, string tipoDeProducto = null, string documentoTipo = null)
        {
            try
            {
                List<string> listTipoDeProducto = null;
                List<string> listDocumentoTipo = null;
                listTipoDeProducto = (!string.IsNullOrEmpty(tipoDeProducto) ? tipoDeProducto.Split(',').ToList() : null);
                listDocumentoTipo = (!string.IsNullOrEmpty(documentoTipo) ? documentoTipo.Split(',').ToList() : null);

                var listaPaginada = servicioProgramaEmbarque.ListarProductosPaginado(nombre, pagina, itemsPorPagina, listTipoDeProducto, listDocumentoTipo);
                var response = new { listaPaginada.Items, listaPaginada.ItemsTotales };
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/ExportarExcelProductos")]
        public HttpResponseMessage ExportarExcelProductos(string nombre = null)
        {
            try
            {
                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
                var productos = servicioProgramaEmbarque.ListarProductosConCalidades(nombre);
                var excel = new ExcelProductos(productos).GenerarExcel();
                response.Content = new ByteArrayContent(excel);
                response.Content.Headers.ContentLength = excel.LongLength;
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                response.Content.Headers.ContentDisposition.FileName = "listado_productos" + ".xls";
                response.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping("listado_exportadores.xls"));
                return response;
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/ProgramaEmbarque/CrearProducto")]
        public HttpResponseMessage CrearProducto(RegistroProductoDto producto)
        {
            try
            {
                servicioProgramaEmbarque.CrearProducto(producto, base.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/ProgramaEmbarque/ObtenerProducto")]
        public HttpResponseMessage ObtenerProducto(int id)
        {
            try
            {
                var producto = this.servicioProgramaEmbarque.ObtenerProducto(id);
                return Request.CreateResponse(HttpStatusCode.OK, producto);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/ProgramaEmbarque/EditarProducto")]
        public HttpResponseMessage EditarProducto(RegistroProductoDto producto)
        {
            try
            {
                servicioProgramaEmbarque.EditarProducto(producto, base.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Route("api/ProgramaEmbarque/EliminarProducto")]
        public HttpResponseMessage EliminarProducto(int id)
        {
            try
            {
                servicioProgramaEmbarque.EliminarProducto(id, base.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        #endregion ABM Producto

    }
}