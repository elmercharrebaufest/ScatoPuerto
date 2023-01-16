using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Procesamiento;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class ProgramaEmbarqueController : BaseController
    {
        private readonly IServicioComandos comandos;

        public ProgramaEmbarqueController(IServicioRepositorio servicio,
            IServicioProgramaEmbarque servicioProgramaEmbarque,
            IServicioComandos comandos) : base(servicio, servicioProgramaEmbarque)
        {
            this.comandos = comandos;

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
        public HttpResponseMessage ListarProgramaEmbarque(int? pagina = null, int? itemsPorPagina = null, DateTime? fecha = null, string muelle = null, string buque = null, string producto = null)
        {
            try
            {
                var paginacion = new Paginacion(null, DirOrden.Desc, (pagina == null) ? 0 : pagina.Value, (itemsPorPagina == 0 || !itemsPorPagina.HasValue) ? 10 : itemsPorPagina.Value);
                var response = servicioProgramaEmbarque.ListarProgramaDeEmbarque(paginacion, fecha,
                    (!string.IsNullOrEmpty(muelle) ? muelle.Split(',').ToList() : null),
                    (!string.IsNullOrEmpty(buque) ? buque.Split(',').ToList() : null),
                    (!string.IsNullOrEmpty(producto) ? producto.Split(',').ToList() : null));
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
                    #endregion

                    #region Registro de recibos
                    var listaNominacionRecibo = (List<NominacionReciboDto>)nominacion.NominacionRecibo;
                    servicioProgramaEmbarque.GuardarNominacionRecibo(listaNominacionRecibo, nominacion.Id);
                    #endregion

                    #region Registro de intervencion
                    resultado = comandos.Ejecutar(new GuardarNominacionDetalleIntervencion
                    {
                        Dto = nominacion.NominacionDetalleIntervencion,
                        nominacion_id = nominacion.Id
                    });
                    #endregion
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
                    EsCreacion = nominacion.NominacionDatoTecnico.Id > 0 ? false : true,
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
        public HttpResponseMessage GuardarNominacionRecibo(int nominacion_id, List<NominacionReciboDto> nominacionRecibo )
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
        public void EnviarMailProgramaEmbarque(MailDto mail)
        {
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
       
            try
            {  
                    // CARACTERES NO IMPRIMIBLES:
                    // Enter: (\n -> <br/>)
                    // Tabulador: (\t -> &nbsp;&nbsp;&nbsp;&nbsp;)
                    // Negrita: (\f -> <b>) (\f\f -> </b>)
                    // Subrayado: (\0 -> <u>) (\0\0 -> </u>)
                comandos.Ejecutar(new EnvioMail
                {
                        Cuerpo = mail.Body.Replace("\n", "<br/>").Replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;")
                        .Replace("\f\f", "</b>").Replace("\f", "<b>").Replace("\0\0", "</u>").Replace("\0", "<u>"),
                        Destinatarios = mail.Destinatarios,                        
                        Titulo = mail.Titulo,
                        AttachmentName = null
                    });
            }
            catch (Exception e)
            {
                response.StatusCode = HttpStatusCode.InternalServerError;
                throw new HttpResponseException(response);
            }
        }

        [HttpGet]        
        [Route("api/ProgramaEmbarque/ObtenerDatosMailProgramaEmbarque")]
        public HttpResponseMessage ObtenerDatosMailProgramaEmbarque(int nominacionId, string tipoDeMail)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK,
                    servicioProgramaEmbarque.ObtenerDatosMailProgramaEmbarque(servicioProgramaEmbarque.ObtenerNominacion(nominacionId), tipoDeMail)
                );
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }


        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ProgramaEmbarque/ObtenerNotificaciones")]
        public HttpResponseMessage obtenerNotificaciones()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicioProgramaEmbarque.ObtenerNotificaciones(base.nombreUsuario));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }



    }
}
