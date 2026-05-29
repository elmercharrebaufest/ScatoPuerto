using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.HorariosExportador;
using Molinos.Scato.Dominio.Comandos.RitmosBrutosYNetos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.HorariosExportador;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Enumeradores;
using Molinos.Scato.WebPuertoApi.Atributos;
using Molinos.Scato.WebPuertoApi.EXCEL;
using Molinos.Scato.WebPuertoApi.Helper;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class ModuloDeCargaController : BaseController
    {
        private readonly IServicioComandos comandos;

        public ModuloDeCargaController(IServicioActividadFactory<IIngresarEmbarqueService> factory,
            IServicioRepositorio servicio, IServicioComandos comandos, 
            IServicioAdministracion servicioAdministracion, IServicioProgramaEmbarque servicioProgramaEmbarque) 
            : base(servicio, servicioProgramaEmbarque, null, null, null, null, servicioAdministracion)
        {
            this.comandos = comandos;
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ListarSentidoManoDeEmbarques")]
        public HttpResponseMessage ListarSentidoManoDeEmbarques()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarSentidoManoDeEmbarques());
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ListarCeldaManoDeEmbarques")]
        public HttpResponseMessage ListarCeldaManoDeEmbarques()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarCeldaManoDeEmbarques());
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/GuardarModuloDeCarga")]
        public HttpResponseMessage GuardarModuloDeCarga(ModuloDeCargaDto moduloDeCarga)
        {
            try
            {
                comandos.Ejecutar(new GuardarModuloDeCarga { Dto = moduloDeCarga, nombreUsuario = base.nombreUsuario });
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerModuloDeCarga")]
        public HttpResponseMessage ObtenerModuloDeCarga(int id)
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ObtenerModuloDeCarga(id));
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/ObtenerUltimaHabilitacionDeTanques")]
        public HttpResponseMessage ObtenerUltimaHabilitacionDeTanques()
        {
            try
            {
                var habilitacion = servicio.ObtenerUltimaHabilitacionDeTanques();
                return Request.CreateResponse(HttpStatusCode.OK, habilitacion);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ListarMotivosDeCorte")]
        public HttpResponseMessage ListarMotivosDeCorte()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarMotivosDeCorte());
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ListarMotivosFallasBalanza")]
        public HttpResponseMessage ListarMotivosFallasBalanza()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarMotivosFallasBalanza());
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ListarTurnoPuerto")]
        public HttpResponseMessage ListarTurnoPuerto()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarTurnoPuerto());
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerCantidadCubitacionDeTanques")]
        public HttpResponseMessage ObtenerCantidadCubitacionDeTanques(string tk, double altura)
        {
            return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerCantidadCubitacionDeTanques(tk, altura)
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerLlenadoMilimetroPorTanque")]
        public HttpResponseMessage ObtenerLlenadoMilimetroPorTanque(int cm, int mm, string tanqueNum)
        {
            try
            {
                string tanqueNumRequest = "";
                if (tanqueNum.Contains("100"))
                {
                    tanqueNumRequest = "T100";
                }
                else
                {
                    if (tanqueNum.Length > 2)
                    {
                        tanqueNum = tanqueNum.Substring(1, 2);
                    }
                    tanqueNumRequest = "TQ" + tanqueNum;
                }
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerLlenadoMilimetroPorTanque(cm.ToString(), mm.ToString(), tanqueNumRequest));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerDensidadPorTemperaturaDeMaterial")]
        public HttpResponseMessage ObtenerDensidadPorTemperaturaDeMaterial(int materialPuertoId, int grado)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerDensidadPorTemperaturaDeMaterial(materialPuertoId, grado));
            }
            catch
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ActualizarEstadoBuque")]
        public HttpResponseMessage ActualizarEstadoBuque(int Embarque_Id, int Estado)
        {
            servicio.ActualizarEstadoBuque(Embarque_Id, Estado);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/GuardarModuloDeCargaUmap")]
        public HttpResponseMessage GuardarModuloDeCargaUmap(List<ModuloDeCargaUmapDto> moduloDeCargaUmaps, int ModuloDeCarga_Id)
        {
            servicio.GuardarModuloDeCargaUmap(moduloDeCargaUmaps, ModuloDeCarga_Id);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerPeriodoDeCargaPorIdModuloDeCarga")]
        public HttpResponseMessage ObtenerPeriodoDeCargaPorIdModuloDeCarga(int idModuloDeCarga)
        {
            try
            {
                var response = servicio.ObtenerPeriodoDeCargaPorIdModuloDeCarga(idModuloDeCarga);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerPeriodoDeCargaNuevo")]
        public HttpResponseMessage ObtenerPeriodoDeCargaNuevo(int idModuloDeCarga)
        {
            try
            {
                var response = servicio.ObtenerPeriodoDeCargaNuevo(idModuloDeCarga);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

		[HttpPost]
		//[Autorizacion(PermisosScato.LineUp)]
		//[Autorizacion(PermisosScato.Liquido_EditarPeriodoDeCarga)]
		[Route("api/ModuloDeCarga/GuardarPeriodoDeCarga")]
		public HttpResponseMessage GuardarPeriodoDeCarga(ModuloDeCargaPeriodoDeCargaDto moduloDeCargaPeriodoDeCargaDto, int moduloDeCarga_Id)
		{
			servicio.GuardarPeriodoDeCarga(moduloDeCargaPeriodoDeCargaDto, moduloDeCarga_Id);

			var embarque = servicio.ObtenerEmbarquePorModuloCargaId(moduloDeCarga_Id);
			if (embarque != null)
			{
				servicioAdministracion.EvaluarEstadoAplicadoParaEmbarque(embarque.Id, base.nombreUsuario);
				
                servicioProgramaEmbarque.ValidarEnviarOperacionSAP(embarque.Id, base.nombreUsuario);
			}

			return Request.CreateResponse(HttpStatusCode.OK);
		}

		[HttpPost]
		[Route("api/ModuloDeCarga/GuardarPeriodoDeCargaNuevo")]
		public HttpResponseMessage GuardarPeriodoDeCargaNuevo(ModuloDeCargaPeriodoDeCargaNuevoDto dto, int moduloDeCarga_Id)
		{
			try
			{
				servicio.GuardarPeriodoDeCargaNuevo(dto, moduloDeCarga_Id, this.nombreUsuario);

				var embarque = servicio.ObtenerEmbarquePorModuloCargaId(moduloDeCarga_Id);
				if (embarque != null)
				{
					servicioAdministracion.EvaluarEstadoAplicadoParaEmbarque(embarque.Id, base.nombreUsuario);
					
                    servicioProgramaEmbarque.ValidarEnviarOperacionSAP(embarque.Id, base.nombreUsuario);
				}

				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpGet]
        //[Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ConsultarCombosFechasYTurnos")]
        public HttpResponseMessage ConsultarCombosFechasYTurnos(int idModuloDeCarga)
        {
            try
            {
                var request = new ConsultarCombosFechasYTurnosRequest()
                {
                    IdModuloDeCarga = idModuloDeCarga
                };
                var response = comandos.Ejecutar(request);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ConsultarRitmosBrutos")]
        public HttpResponseMessage ConsultarRitmosBrutos(int idModuloDeCarga, string fecha)
        {
            try
            {
                var request = new ConsultarRitmosBrutosRequest()
                {
                    IdModuloDeCarga = idModuloDeCarga,
                    Fecha = Convert.ToDateTime(fecha)
                };
                var response = comandos.Ejecutar(request);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/ConsultarBalanzasCortes")]
        public HttpResponseMessage ConsultarBalanzasCortes(int idModuloDeCarga)
        {
            try
            {
                var request = new ConsultarBalanzasCortesRequest()
                {
                    IdModuloDeCarga = idModuloDeCarga
                };
                var response = comandos.Ejecutar(request);
                return Request.CreateResponse(HttpStatusCode.OK, response);
            }
            catch
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.Liquido_EditarPeriodoDeCarga)]
        [Route("api/ModuloDeCarga/ActualizarFechasPeriodoDeCarga")]
        public HttpResponseMessage ActualizarFechasPeriodoDeCarga(ModuloDeCargaPeriodoDeCargaDto moduloDeCargaPeriodoDeCargaDto, int moduloDeCarga_Id, bool esFechaInicio)
        {
            servicio.ActualizarFechasPeriodoDeCarga(moduloDeCargaPeriodoDeCargaDto, moduloDeCarga_Id, esFechaInicio);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarPlanillaDeEmbarque")]
        public HttpResponseMessage GuardarPlanillaDeEmbarque(List<ModuloDeCargaPlanillaDeEmbarqueDto> planillaDeEmbarqueDtos, int idModuloDeCarga)
        {
            try
            {
                comandos.Ejecutar(new GuardarPlanillaDeEmbarque { Dto = planillaDeEmbarqueDtos, IdModuloDeCarga = idModuloDeCarga, nombreUsuario = base.nombreUsuario });
                List<ModuloDeCargaPlanillaDeEmbarqueDto> planillaDeEmbarqueDtos1 = servicio.ObtenerModuloDeCarga(idModuloDeCarga)?.ModuloDeCargaPlanillaDeEmbarque.ToList();
                return Request.CreateResponse(HttpStatusCode.OK, planillaDeEmbarqueDtos1);
            }
            catch
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/EliminarDetallePlanillaDeEmbarqueLiquido")]
        public HttpResponseMessage EliminarDetallePlanillaDeEmbarqueLiquido(int idModuloDeCargaPlanillaDetalle)
        {
            try
            {
                servicio.EliminarDetallePlanillaDeEmbarqueLiquido(idModuloDeCargaPlanillaDetalle);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/EliminarDetallePlanillaDeTurnosCortes")]
        public HttpResponseMessage EliminarDetallePlanillaDeTurnosCortes(int idModuloDeCargaPlanillaCorte)
        {
            try
            {
                servicio.EliminarDetallePlanillaDeTurnosCortes(idModuloDeCargaPlanillaCorte);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarModuloDeCargaBalanzas")]
        public HttpResponseMessage GuardarModuloDeCargaBalanzas(ModuloBalanzas moduloBalanzas)
        {
            try
            {
                comandos.Ejecutar(new GuardarBalanzadas { moduloBalanzas = moduloBalanzas });
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.Recibidores_Nir_EnviarNir)]
        [Route("api/ModuloDeCarga/GuardarModuloDeCargaNirManualPuerto")]
        public HttpResponseMessage GuardarModuloDeCargaNirManualPuerto(int IdModuloDeCarga, ObjetoMailNir ObjetoMailNir, string nombreBuque)
        {
            try
            {
                var path = System.Web.HttpContext.Current.Server.MapPath("~/iconMolinosChiquito.png");
                //System.Web.HttpServerUtility server = new System.Web.HttpServerUtility();
                byte[] data = File.ReadAllBytes(path);

                var resultado = new ResultadoPrevisualizar();
                comandos.Ejecutar(new GuardarNirManual { Dto = ObjetoMailNir.nirManualPuerto, IdModuloDeCarga = IdModuloDeCarga });
                if (nombreBuque != "undefined")
                {
                    var docFile = "Nir.xls";

                    var generadorExcel = new ExcelNirManual();

                    generadorExcel.GenerarArchivo(resultado, ObjetoMailNir.nirManualPuerto, IdModuloDeCarga, nombreBuque, data);
                    List<string> Emails = new List<string>();
                    Emails = ObjetoMailNir.mail.Destinatarios;

                    comandos.Ejecutar(new EnvioMail
                    {
                        Cuerpo = ObjetoMailNir.mail.Body,
                        Destinatarios = Emails,
                        Titulo = $"NIR" + "-" + nombreBuque,
                        Attachment = resultado.Archivo,
                        AttachmentName = docFile
                    });
                }
                servicio.EscribirLog($"Se envio el nir para el moduloDeCargaId={IdModuloDeCarga} con exito, ejecutado por {base.nombreUsuario}", TipoLog.Info, "ModuloDecarga/GuardarModuloDeCargaNirManualPuerto");
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                servicio.EscribirLog($"Hubo un problema al intentar enviar el nir para el moduloDeCargaId={IdModuloDeCarga}, ejecutado por {base.nombreUsuario}", TipoLog.Error, "ModuloDecarga/GuardarModuloDeCargaNirManualPuerto", e.Message);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        public class ObjetoMailNir
        {
            public List<ModuloDeCargaNirManualPuertoDto> nirManualPuerto;
            public MailDto mail;
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerDatosMailPlanillaLiquidos")]
        public HttpResponseMessage ObtenerDatosMailPlanillaLiquidos(int moduloDeCargaId, string idsOcultos, bool verObservaciones, bool esFin)
        {
            try
            {
                List<int> cortesOcultos = new List<int> { };
                if (idsOcultos != null)
                {
                    cortesOcultos = idsOcultos.Split(',').Select(int.Parse).ToList();
                }
                var horarios = servicio.ListarHorariosExportador(moduloDeCargaId);
                var periodoCarga = esFin ? servicio.ObtenerPeriodoDeCargaNuevo(moduloDeCargaId) : null;
                var embarque = servicio.ObtenerEmbarquePorModuloCargaId(moduloDeCargaId);
                var planoDeCargaId = servicio.obtenerPlanoDeCargaId(embarque.Id);
                var planoDeCarga = servicio.ObtenerPlanoDeCarga(planoDeCargaId);
                var moduloDeCarga = servicio.ObtenerModuloDeCarga(moduloDeCargaId);
                var destinatarios = servicio.obtenerDireccionesDeMail("PlanillaDeTurnos");
                var mailDto = new NotificacionPlanillaTurnos(horarios, embarque, planoDeCarga, moduloDeCarga, destinatarios, verObservaciones, periodoCarga, cortesOcultos).GenerarMail();
                return Request.CreateResponse(HttpStatusCode.OK, mailDto);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerDestinatariosNirManual")]
        public HttpResponseMessage ObtenerDestinatariosNirManual()
        {
            try
            {
                List<string> templates = new List<string> { "PlanillaDeTurnos", "NirManual" };
                var destinatariosNir = servicio.ObtenerDireccionesDeMailPorTemplates(templates);
                return Request.CreateResponse(HttpStatusCode.OK, destinatariosNir);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerSupervisoresDeRecibo")]
        public HttpResponseMessage ObtenerSupervisoresDeRecibo()
        {
            try
            {
                string destinatarios = servicio.obtenerDireccionesDeMail("SupervisoresRecibo");
                System.Collections.Generic.List<string> dest = new System.Collections.Generic.List<string>();
                foreach (string mail in destinatarios.Split(';'))
                    dest.Add(mail);
                return Request.CreateResponse(HttpStatusCode.OK, dest);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerModuloDeCargaPlanillaDeTurnos")]
        public HttpResponseMessage ObtenerModuloDeCargaPlanillaDeTurnos(int turnoPuerto_id, int moduloDeCarga_id, bool esLiquido, string fechaTurno)
        {
            try
            {
                //bool esLiquido = true;
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerModuloDeCargaPlanillaDeTurnos(turnoPuerto_id, moduloDeCarga_id, esLiquido, fechaTurno));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.TableroLiquido_GuardarTurno)]
        [Route("api/ModuloDeCarga/GuardarTurnoPlanillaDeTurnos")]
        public HttpResponseMessage GuardarTurnoPlanillaDeTurnos(int IdModuloDeCarga, ModuloDeCargaPlanillaDeTurnosDto turnos, bool Enviado = false, bool DesdeRecibidores = false, bool desdeVicentinNouryon = false)
        {
            try
            {
                comandos.Ejecutar(new GuardarPlanillaDeTurnos { Dto = turnos, IdModuloDeCarga = IdModuloDeCarga, Enviado = Enviado, DesdeRecibidores = DesdeRecibidores, nombreUsuario = base.nombreUsuario, DesdeVicentinNouryon = desdeVicentinNouryon });
                if (!desdeVicentinNouryon) {
                    servicio.ActualizarHorariosExportadorLiquidos(IdModuloDeCarga);
                }                
                return Request.CreateResponse(HttpStatusCode.OK);                
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.TableroLiquido_GuardarTurno)]
        [Route("api/ModuloDeCarga/GuardarDetalleLiquido")]
        public HttpResponseMessage GuardarDetalleLiquido(int idTurno, int idModuloDeCarga, ModuloDeCargaPlanillaDeTurnosDetallesLiquidoDto detalleLiquido)
        {
            try
            {
                comandos.Ejecutar(new GuardarDetalleLiquidoPlanillaTurno { Dto = detalleLiquido, IdTurno = idTurno, NombreUsuario = base.nombreUsuario });
               
                servicio.ActualizarHorariosExportadorLiquidos(idModuloDeCarga);
          
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.TableroLiquido_GuardarTurno)]
        [Route("api/ModuloDeCarga/GuardarDetalleSolido")]
        public HttpResponseMessage GuardarDetalleSolido(int idTurno,int idModuloDeCarga, ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto detalleSolido)
        {
            try
            {
                comandos.Ejecutar(new GuardarDetalleSolidoPlanillaTurno { Dto = detalleSolido, IdTurno = idTurno, NombreUsuario = base.nombreUsuario });
             
                servicio.ActualizarHorariosExportadorSolidos(idModuloDeCarga);
                
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPut]       
        [Autorizacion(PermisosScato.TableroLiquido_GuardarTurno)]
        [Route("api/ModuloDeCarga/ActualizarTurnoPlanillaDeTurnos")]
        public HttpResponseMessage ActualizarTurnoPlanillaDeTurnos(int idPlanillaDeTurno, bool cerrado)
        {
            try
            {
                comandos.Ejecutar(new ActualizarPlanillaDeTurno { IdPlanillaDeTurno = idPlanillaDeTurno, Cerrado = cerrado });
            
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpDelete]
        [Autorizacion(PermisosScato.TableroLiquido_GuardarTurno)]
        [Route("api/ModuloDeCarga/EliminarTurnoPlanillaDeTurnos")]
        public HttpResponseMessage EliminarTurnoPlanillaDeTurnos(int idPlanillaDeTurno)
        {
            try
            {
                servicio.EliminarPlanillaDeTurno(idPlanillaDeTurno, this.nombreUsuario);

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpDelete]
        [Autorizacion(PermisosScato.TableroLiquido_GuardarTurno)]
        [Route("api/ModuloDeCarga/EliminarModuloDeCargaPlanillaDeTurnosDetallesSolido")]
        public HttpResponseMessage EliminarModuloDeCargaPlanillaDeTurnosDetallesSolido(int id, int moduloDeCargaId)
        {
            try
            {
                servicio.EliminarModuloDeCargaPlanillaDeTurnosDetallesSolido(id, this.nombreUsuario);

                servicio.ActualizarHorariosExportadorSolidos(moduloDeCargaId);

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpDelete]
        [Autorizacion(PermisosScato.TableroLiquido_GuardarTurno)]
        [Route("api/ModuloDeCarga/EliminarModuloDeCargaPlanillaDeTurnosDetallesLiquido")]
        public HttpResponseMessage EliminarModuloDeCargaPlanillaDeTurnosDetallesLiquido(int id, int moduloDeCargaId)
        {
            try
            {
                servicio.EliminarModuloDeCargaPlanillaDeTurnosDetallesLiquido(id, this.nombreUsuario);

                servicio.ActualizarHorariosExportadorLiquidos(moduloDeCargaId);

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.TableroLiquido_GuardarTurno)]
        [Route("api/ModuloDeCarga/GuardarPlanillaDeTurnosMail")]
        public HttpResponseMessage GuardarPlanillaDeTurnosMail(int IdModuloDeCarga, ObjetoMail ObjetoMail)
        {
            try
            {
                var resultado = new ResultadoPrevisualizar();
                comandos.Ejecutar(new GuardarPlanillaDeTurnos { Dto = ObjetoMail.planillaDeTurnos, IdModuloDeCarga = IdModuloDeCarga });

                string fechaTurno = ObjetoMail.planillaDeTurnos.Fecha.Value.ToString("yyyyMMdd");

                var docFile = "Planilla de turnos" + fechaTurno + ".xls";

                var generadorExcel = new ExcelLiquido();
                List<ModuloDeCargaPlanillaDeTurnosDto> moduloDeCargaPlanillaDeTurnosTurnosDtos = new List<ModuloDeCargaPlanillaDeTurnosDto>();
                moduloDeCargaPlanillaDeTurnosTurnosDtos.Add(ObjetoMail.planillaDeTurnos);

                generadorExcel.GenerarArchivo(resultado, moduloDeCargaPlanillaDeTurnosTurnosDtos, IdModuloDeCarga);
                List<string> Emails = new List<string>();
                Emails = ObjetoMail.mail.Destinatarios;
                // CARACTERES NO IMPRIMIBLES:
                // Enter: (\n -> <br/>)
                // Tabulador: (\t -> &nbsp;&nbsp;&nbsp;&nbsp;)
                // Negrita: (\f -> <b>) (\f\f -> </b>)
                // Subrayado: (\0 -> <u>) (\0\0 -> </u>)
                comandos.Ejecutar(new EnvioMail
                {
                    Cuerpo = ObjetoMail.mail.Body,// "Planilla del dia " + planillaDeTurnosDto.Fecha,
                    Destinatarios = Emails,
                    Titulo = $"Planilla de turnos Modulo de carga " + IdModuloDeCarga + fechaTurno,
                    Attachment = resultado.Archivo,
                    AttachmentName = docFile
                });

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        public class ObjetoMail
        {
            public ModuloDeCargaPlanillaDeTurnosDto planillaDeTurnos;

            public MailDto mail;
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.TableroLiquido_GuardarTurno)]
        [Route("api/ModuloDeCarga/EnviarPlanillaTurnoLiquido")]
        public HttpResponseMessage EnviarPlanillaTurnoLiquido(int IdModuloDeCarga, ObjetoEnvioPlanillaTurno objetoEnvioPlanillaTurno)
        {
            try
            {
                var resultado = new ResultadoPrevisualizar();
                var docFile = "Planilla de turnos" + DateTime.Now.ToString("yyyy-MM-dd") + ".xls";

                if (objetoEnvioPlanillaTurno.mail.Destinatarios != null && objetoEnvioPlanillaTurno.mail.Destinatarios.Any())
                {
                    objetoEnvioPlanillaTurno.mail.Destinatarios.RemoveAll(item => item == null || item == "");
                }

                if (objetoEnvioPlanillaTurno.mail.Copia != null && objetoEnvioPlanillaTurno.mail.Copia.Any())
                {
                    objetoEnvioPlanillaTurno.mail.Copia.RemoveAll(item => item == null || item == "");
                }

                byte[] archivoPlanilla = Convert.FromBase64String(objetoEnvioPlanillaTurno.archivo.Replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,", ""));

                var embarque = servicio.ObtenerEmbarquePorModuloCargaId(IdModuloDeCarga);

                if (embarque.Vicentin || embarque.Noryon)
                {
                    var planillaTurnos =
                        servicio.ObtenerPlanillaDetalleTurnosSolidoCerrados(IdModuloDeCarga);                    

                    var excel = new ExcelPlanillaVicentinNouryonLiquido(
                        archivoPlanilla,
                        planillaTurnos
                    );

                    archivoPlanilla = excel.Generar();
                }


                var res = comandos.Ejecutar(new EnvioMail
                {
                    Titulo = objetoEnvioPlanillaTurno.mail.Titulo,
                    Cuerpo = objetoEnvioPlanillaTurno.mail.Body,
                    Destinatarios = objetoEnvioPlanillaTurno.mail.Destinatarios,
                    Copia = objetoEnvioPlanillaTurno.mail.Copia,
                    Attachment = archivoPlanilla,
                    AttachmentName = docFile
                });

                if (res.HayErrores)
                {
                    throw new Exception("Error al enviar mail: " + res.Errores[""]);
                }

                var objetoPlanillaExcel = new ObjetoPlanillaExcel
                {
                    IdModuloDeCarga = IdModuloDeCarga,
                    Archivo = objetoEnvioPlanillaTurno.archivo,
                    EsLiquido = true
                };

                this.GuardarPlanillaTurnoLiquido(objetoPlanillaExcel);

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                servicio.EscribirLog($"Hubo un error al intentar enviar la planilla de liquidos recibidores, ejecutado por: {base.nombreUsuario}", TipoLog.Error, "Controller: ModuloDeCarga, EnviarPlanillaTurnoLiquido", e.Message);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        public class ObjetoEnvioPlanillaTurno
        {
            public MailDto mail;
            public string archivo;
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/SincronizarBalanzasCortes")]
        public HttpResponseMessage SincronizarBalanzasCortes(int IdModuloDeCarga)
        {
            try
            {
                comandos.Ejecutar(new SincronizarBalanzasCortes { IdModuloDeCarga = IdModuloDeCarga });

                CortesRegistrados cor = new CortesRegistrados()
                {
                    balanzas = servicio.ObtenerCortesBalanzas(IdModuloDeCarga),
                    informacionAdicional = servicio.ObtenerInformacionCortesBalanzas(IdModuloDeCarga),
                    //balanzadasEnCurso = servicio.ObtenerBalanzadasEnCurso(IdModuloDeCarga)
                };

                return Request.CreateResponse(HttpStatusCode.OK, cor);
            }
            catch (Exception ex)
            {
                servicio.GenerarLogging("SincronizarBalanzasCortes", ex.InnerException.ToString(), "POST", base.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ListarInformacionBalanzasCortes")]
        public HttpResponseMessage ListarInformacionBalanzasCortes(int IdModuloDeCarga)
        {
            try
            {
                CortesRegistrados cor = new CortesRegistrados()
                {
                    balanzas = servicio.ObtenerCortesBalanzas(IdModuloDeCarga),
                    informacionAdicional = servicio.ObtenerInformacionCortesBalanzas(IdModuloDeCarga)
                };

                return Request.CreateResponse(HttpStatusCode.OK, cor);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        public class CortesRegistrados
        {
            public IList<BalanzasCortesDto> balanzas { get; set; }
            public Dictionary<string, string> informacionAdicional { get; set; }
            //public BalanzadasCompletasDto balanzadasEnCurso { get; set; }
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/ObtenerBalanzadasEnCurso")]
        public HttpResponseMessage obtenerBalanzadasEnCurso([FromUri] int IdModuloDeCarga)
        {
            if (IdModuloDeCarga <= 0)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "El IdModuloDeCarga debe ser un número entero positivo.");
            }
            try
            {
                var balanzadasEnCurso = servicio.ObtenerBalanzadasEnCurso(IdModuloDeCarga);
                var responseContent = new BalanzadasCompletas { balanzadasEnCurso = balanzadasEnCurso };

                return Request.CreateResponse(HttpStatusCode.OK, responseContent);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        public class BalanzadasCompletas
        {
            public BalanzadasCompletasDto balanzadasEnCurso { get; set; }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/SincronizarRitmosBalanzas")]
        public HttpResponseMessage SincronizarRitmosBalanzas(int IdModuloDeCarga)
        {
            try
            {
                RitmosBalanzas78 ritmosBalanzas78 = new RitmosBalanzas78()
                {
                    idModuloDeCarga = IdModuloDeCarga,
                    ritmosBalanza7 = servicio.ObtenerRitmosBalanzas78(IdModuloDeCarga, 7),
                    ritmosBalanza8 = servicio.ObtenerRitmosBalanzas78(IdModuloDeCarga, 8)
                };

                return Request.CreateResponse(HttpStatusCode.OK, ritmosBalanzas78);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        public class RitmosBalanzas78
        {
            public int idModuloDeCarga;
            public Dictionary<string, string> ritmosBalanza7 { get; set; }
            public Dictionary<string, string> ritmosBalanza8 { get; set; }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.TableroSolido_MotivoCorte_Editar)]
        [Route("api/ModuloDeCarga/EliminarCorteBalanza")]
        public HttpResponseMessage EliminarCorteBalanza(int idCorteBalanza)
        {
            try
            {
                servicio.EliminarCorteBalanza(idCorteBalanza, base.nombreUsuario);

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ListadoBodegas")]
        public HttpResponseMessage ListadoBodegas()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ListadoBodegas());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        //[HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        //[Route("api/ModuloDeCarga/ObtenerCantidadadesPlanillaTurno")]
        //public HttpResponseMessage ObtenerCantidadadesPlanillaTurno(string tk, int temp, string cmI, string mmI, string cmF, string mmF, int materialPuertoId)
        //{
        //    try
        //    {
        //        var Densidad = servicio.ObtenerDensidadPorTemperaturaDeMaterial(materialPuertoId, temp);

        //        var LitrosInicial = servicio.ObtenerLlenadoMinimetroPorTanque(cmI, mmI, tk);

        //        var LitrosFinal = servicio.ObtenerLlenadoMinimetroPorTanque(cmF, mmF, tk);

        //        var Cantidad = decimal.Round((LitrosInicial * Densidad) - (LitrosFinal * Densidad));

        //        return Request.CreateResponse(HttpStatusCode.OK, Cantidad);
        //    }
        //    catch (Exception ex)
        //    {
        //        return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
        //    }
        //}

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.TableroSolido_IniciarCargaBalanzas)]
        [Route("api/ModuloDeCarga/GuardarFechaInicioCarga")]
        public HttpResponseMessage GuardarFechaInicioCarga(int embarque_Id, string fechaHorastring)
        {
            DateTime fechaHoraInicioCarga = DateTime.ParseExact(fechaHorastring, "yyyy-MM-dd HH:mm", null);
            servicio.GuardarFechaInicioCarga(embarque_Id, fechaHoraInicioCarga);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.TableroSolido_CorteManualBalanzas)]
        [Route("api/ModuloDeCarga/GuardarBalanzaCorte")]
        public HttpResponseMessage GuardarBalanzaCorte(List<BalanzasCortesDto> balanzasCortesDtos)
        {
            try
            {
                servicio.GuardarBalanzaCorte(balanzasCortesDtos);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (ValidationCustomException vce)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, vce.Message);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerRitmos")]
        public HttpResponseMessage ObtenerRitmos(int modulodecarga_id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerRitmos(modulodecarga_id));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarLineasDeEmbarque")]
        public HttpResponseMessage GuardarLineasDeEmbarque(List<ModuloDeCargaLineasDeEmbarqueDto> lineasDeEmbarque, int idModuloDeCarga)
        {
            try
            {
                var res = comandos.Ejecutar(new GuardarLineasDeEmbarque { Dto = lineasDeEmbarque, IdModuloDeCarga = idModuloDeCarga, Usuario = base.nombreUsuario });
                if (res.HayErrores)
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, res.Errores[""]);
                }
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/GuardarObservacionesDeCalidad")]
        public HttpResponseMessage GuardarObservacionesDeCalidad(int idPlanillaDeTurnos, List<ModuloDeCargaPlanillaDeTurnosObservacionesDeCalidadDto> observacionesDeCalidadDto)
        {
            servicio.GuardarObservacionesDeCalidad(idPlanillaDeTurnos, observacionesDeCalidadDto);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerRitmosLiquidos")]
        public HttpResponseMessage ObtenerRitmosLiquidos(int modulodecarga_id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerRitmosLiquidos(modulodecarga_id));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerModuloDeCargaNirManualPuerto")]
        public HttpResponseMessage ObtenerModuloDeCargaNirManualPuerto(int moduloDeCarga_id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerModuloDeCargaNirManualPuerto(moduloDeCarga_id));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerParametros")]
        public HttpResponseMessage ObtenerParametros()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerParametros());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ObtenerParametro")]
        public HttpResponseMessage ObtenerParametros(string descripcion)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerParametro(descripcion));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        //[HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        //[Route("api/ModuloDeCarga/ObtenerRitmosDeEmbarque")]
        //public HttpResponseMessage ObtenerRitmosDeEmbarque(int vapor_id)
        //{
        //    try
        //    {
        //        return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerRitmosDeEmbarque(vapor_id));
        //    }
        //    catch (Exception ex)
        //    {
        //        return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
        //    }
        //}

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerCargasPlanillaDeTurnosSolido")]
        public HttpResponseMessage ObtenerCargasPlanillaDeTurnosSolido(int moduloDeCarga_id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerCargasPlanillaDeTurnosSolido(moduloDeCarga_id));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/ModuloDeCarga/EliminarObservacionDeCalidad")]
        public HttpResponseMessage EliminarObservacionDeCalidad(int observacion_id)
        {
            try
            {
                servicio.EliminarObservacionDeCalidad(observacion_id);

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/CerrarTurnoModuloDeCarga")]
        public HttpResponseMessage CerrarTurnoModuloDeCarga(int idPlanillaDeTurnos)
        {
            servicio.CerrarTurnoModuloDeCarga(idPlanillaDeTurnos);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ReabrirTurnoLiquido")]
        public HttpResponseMessage ReabrirTurnoLiquido(int idPlanillaDeTurnos)
        {
            servicio.ReabrirTurnoLiquido(idPlanillaDeTurnos, base.nombreUsuario);
            return Request.CreateResponse(HttpStatusCode.OK);
        }


        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/CerrarTurnoLiquido")]
        public HttpResponseMessage CerrarTurnoLiquido(int idPlanillaDeTurnos)
        {
            servicio.CerrarTurnoLiquido(idPlanillaDeTurnos, base.nombreUsuario);
            return Request.CreateResponse(HttpStatusCode.OK);
        }


        [HttpPost]
        [Route("api/ModuloDeCarga/GuardarReciboDeBuque")]
        public HttpResponseMessage GuardarReciboDeBuque(int idEmbarque, ReciboDeBuqueDto reciboDeBuque)
        {
            try
            {
                if (reciboDeBuque.FechaHoraImpresion != null) reciboDeBuque.FechaHoraImpresion = reciboDeBuque.FechaHoraImpresion.Value.ToLocalTime();

                servicio.GuardarReciboDeBuque(idEmbarque, reciboDeBuque);

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ListarRecibosDeBuque")]
        public HttpResponseMessage ListarRecibosDeBuque(int idEmbarque)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarRecibosDeBuque(idEmbarque));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ListarTipoLineaEmbarque")]
        public HttpResponseMessage ListarTipoLineaEmbarque()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarTipoLineaEmbarque());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarCapturaImagenLineUp")]
        public HttpResponseMessage GuardarCapturaImagenLineUp(CapturaImagenLineUp capturaImagenLineUp)
        {
            try
            {
                servicio.GuardarCapturaImagenLineUp(capturaImagenLineUp.Embarque_Id, capturaImagenLineUp.FilePathImgLineUp);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                servicio.GenerarLogging("GuardarCapturaImagenLineUp", ex.InnerException.ToString(), "POST", base.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ListarNominacionesRecibos")]
        public HttpResponseMessage ListarNominacionesRecibos(int idEmbarque)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarNominaciones(idEmbarque));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/DeshabilitarReciboBuque")]
        public HttpResponseMessage DeshabilitarReciboBuque(ReciboDeBuqueDto reciboDeBuque)
        {
            try
            {
                servicio.DeshabilitarReciboBuque(reciboDeBuque, base.nombreUsuario);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/ListarSiloCelda")]
        public HttpResponseMessage ListarSiloCelda()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarSiloCelda());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/ListarSiloCeldaPorMuelle")]
        public HttpResponseMessage ListarSiloCeldaPorMuelle(int muelleId)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarSiloCeldaPorMuelle(muelleId));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/ModuloDeCarga/GuardarCargaManualSolidos")]
        public HttpResponseMessage GuardarCargaManual(int idModuloDeCarga, bool desdeHistorial, List<ModuloDeCargaPlanillaDeTurnosDto> turnos, string obsPlanilla)
        {
            var resultado = comandos.Ejecutar(new GuardarPlanillaCargaManualSolidos { IdModuloDeCarga = idModuloDeCarga, Turnos = turnos, DesdeHistorial = desdeHistorial, Usuario = base.nombreUsuario, ObservacionPlanilla = obsPlanilla });
            if (resultado.HayErrores)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, resultado.Errores[""]);
            }
            servicio.ActualizarHorariosExportadorSolidos(idModuloDeCarga);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        public class CapturaImagenLineUp
        {
            public int Embarque_Id { get; set; }
            public string FilePathImgLineUp { get; set; }
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/GenerarExcelTurnos")]
        public HttpResponseMessage GenerarExcelTurnos(int moduloDeCargaId, int embarqueId)
        {
            try
            {
                var listaPlanoDeCargaBodega = servicio.ObtenerPlanoDeCargaBodega(moduloDeCargaId);
                var balanzasManual = servicio.ListarBalanzaManual(moduloDeCargaId);
                var embarque = servicio.ObtenerEmbarque(embarqueId);
                var listaTurnos = servicio.ObtenerPlanillaDetalleTurnosSolido(moduloDeCargaId);
                var nominaciones = servicio.ListarNominacionesDeEmbarque(embarqueId);
                var modCarga = servicio.ObtenerModuloDeCarga(moduloDeCargaId);
                var ritmos = servicio.ObtenerRitmosCargaManual(moduloDeCargaId, true, null, null);
                var archivo = new ExcelPlanillaTurnosSolidoOp(listaTurnos, listaPlanoDeCargaBodega, balanzasManual, embarque, nominaciones, modCarga, ritmos).GenerarExcel();
                var filename = embarqueId + "-" + embarque.Patente + ".xlsx";
                servicio.GuardarPlanillaOperacionesEnCarpetaMolinos(archivo, filename, false);
                HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new ByteArrayContent(archivo)

                };
                response.Content.Headers.ContentLength = archivo.LongLength;
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                servicio.EscribirLog($"Se guarda OK la planilla de solidos con ModCargaId: {moduloDeCargaId}, ejecutado por: {base.nombreUsuario}", TipoLog.Info, "ModuloDeCarga/GenerarExcelTurnos");
                return response;
            }
            catch (Exception e)
            {
                servicio.EscribirLog($"Hubo un error al intentar guardar la planilla de solidos, ModCargaId: {moduloDeCargaId}, ejecutado por: {base.nombreUsuario}", TipoLog.Error, "ModuloDeCarga/GenerarExcelTurnos");
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/GenerarExcelTurnosLiquidos")]
        public HttpResponseMessage GenerarExcelTurnosLiquidos(int moduloDeCargaId)
        {
            try
            {
                var modCarga = servicio.ObtenerModuloDeCarga(moduloDeCargaId);
                var embarque = servicio.ObtenerEmbarquePorModuloCargaId(moduloDeCargaId);
                var nominaciones = servicio.ListarNominacionesDeEmbarque(embarque.Id);
                var eventos = servicio.ListarEventosLiquidos(moduloDeCargaId).ToList();
                var bodegasDestino = servicio.ObtenerBodegasPlano(moduloDeCargaId); 
                var archivo = new ExcelPlanillaTurnosLiquidoOp(modCarga, nominaciones, embarque, eventos, bodegasDestino).GenerarExcel();
                var filename = embarque.Id + "-" + embarque.Patente + ".xlsx";
                servicio.GuardarPlanillaOperacionesEnCarpetaMolinos(archivo, filename, true);
                HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new ByteArrayContent(archivo)

                };
                response.Content.Headers.ContentLength = archivo.LongLength;
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                servicio.EscribirLog($"Se guarda OK la planilla de liquidos con ModCargaId: {moduloDeCargaId}, ejecutado por: {base.nombreUsuario}", TipoLog.Info, "ModuloDeCarga/GenerarExcelTurnosLiquidos");
                return response;
            }
            catch (Exception e)
            {
                servicio.EscribirLog($"Hubo un error al intentar guardar la planilla de liquidos, ModCargaId: {moduloDeCargaId}, ejecutado por: {base.nombreUsuario}, {e.InnerException}", TipoLog.Error, "ModuloDeCarga/GenerarExcelTurnosLiquidos");
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.InnerException);
            }
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/RitmosCargaSolidos")]
        public HttpResponseMessage RitmosCargaSolidos(int idModuloDeCarga, string fechaTurno, int? turno, bool esCalculoGeneral)
        {
            try
            {
                DateTime? dtFechaTurno = null;
                if (!string.IsNullOrEmpty(fechaTurno))
                {
                    dtFechaTurno = DateTime.Parse(fechaTurno);
                }
                var res = servicio.ObtenerRitmosCargaManual(idModuloDeCarga, esCalculoGeneral, dtFechaTurno, turno);
                return Request.CreateResponse(HttpStatusCode.OK, res);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/ModuloDeCarga/ObtenerRitmosBalanzaManual")]
        public HttpResponseMessage ObtenerRitmosBalanzaManual(int modulodecarga_id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerRitmosBalanzaManual(modulodecarga_id));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/ListarPlanillaTurnos")]
        public HttpResponseMessage ListarPlanillaTurnos(int moduloDeCargaId)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerPlanillaDetalleTurnosSolido(moduloDeCargaId));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/ObtenerDatosMailPlanillaSolidos")]
        public HttpResponseMessage ObtenerDatosMailPlanillaSolidos(int moduloDeCargaId, string idsOcultos, bool verObservaciones, bool esFin)
        {
            try
            {
                List<int> cortesOcultos = new List<int> { };
                if (idsOcultos != null)
                {
                    cortesOcultos = idsOcultos.Split(',').Select(int.Parse).ToList();
                }
                var moduloCarga = servicio.ObtenerModuloDeCarga(moduloDeCargaId);
                var embarque = servicio.ObtenerEmbarquePorModuloCargaId(moduloDeCargaId);
                var horarios = servicio.ListarHorariosExportador(moduloDeCargaId);
                var planoDeCargaId = servicio.obtenerPlanoDeCargaId(embarque.Id);
                var planoDeCarga = servicio.ObtenerPlanoDeCarga(planoDeCargaId);
                var periodoCarga = esFin ? servicio.ObtenerPeriodoDeCargaNuevo(moduloDeCargaId) : null;

                var templates = new List<string> { "PlanillaDeTurnos" };
                if (moduloCarga.ModuloDeCargaNirManualPuerto != null && moduloCarga.ModuloDeCargaNirManualPuerto.Any())
                {
                    templates.Add("NirManual");
                }
                var destinatariosList = servicio.ObtenerDireccionesDeMailPorTemplates(templates);
                var destinatarios = string.Join(";", destinatariosList);

                var mail = new NotificacionPlanillaTurnos(horarios, embarque, planoDeCarga, moduloCarga, destinatarios, verObservaciones, periodoCarga, cortesOcultos).GenerarMail();
                return Request.CreateResponse(HttpStatusCode.OK, mail);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/ObtenerDatosMailInicioCarga")]
        public HttpResponseMessage ObtenerDatosMailInicioCarga(int moduloDeCargaId)
        {
            try
            {
                var embarque = servicio.ObtenerEmbarquePorModuloCargaId(moduloDeCargaId);               
                var destinatarios = servicio.obtenerDireccionesDeMail("PlanillaDeTurnos");
                var periodoCarga = servicio.ObtenerPeriodoDeCargaNuevo(moduloDeCargaId);

                var mail = new NotificacionInicioCarga(embarque, periodoCarga, destinatarios).GenerarMail();

                return Request.CreateResponse(HttpStatusCode.OK, mail);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        public class ObjetoPlanillaExcel
        {
            public int IdModuloDeCarga { get; set; }
            public string Archivo { get; set; }
            public bool EsLiquido { get; set; }
        }               

        [HttpPost]
        [Autorizacion(PermisosScato.TableroLiquido_GuardarTurno)]
        [Route("api/ModuloDeCarga/GuardarPlanillaTurnoSolido")]
        public HttpResponseMessage GuardarPlanillaTurnoSolido(ObjetoPlanillaExcel objetoPlanillaExcel)
        {
            try
            {
                var embarque = servicio.ObtenerEmbarquePorModuloCargaId(objetoPlanillaExcel.IdModuloDeCarga);

                var nombreMuelle = embarque.Vicentin
                    ? " (Vicentin)"
                    : embarque.Noryon
                        ? " (Nouryon)"
                        : "";

                var filename = $"{embarque.Id} - {embarque.Patente}{nombreMuelle}.xlsx";

                // =========================
                // EXCEL BASE (FRONT)
                // =========================
                byte[] archivoPlanilla = Convert.FromBase64String(
                    objetoPlanillaExcel.Archivo.Replace(
                        "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,",
                        ""
                    )
                );

                // =========================
                // COMPLETAR DATOS SOLO VICENTIN / NOURYON
                // =========================
                if (embarque.Vicentin || embarque.Noryon)
                {
                    var planillaTurnos =
                        servicio.ObtenerPlanillaDetalleTurnosSolidoCerrados(objetoPlanillaExcel.IdModuloDeCarga);

                    var excel = new ExcelPlanillaVicentinNouryonSolido(
                        archivoPlanilla,
                        planillaTurnos
                    );

                    archivoPlanilla = excel.Generar();
                }

                // =========================
                // GUARDAR EN CARPETA (BACK)
                // =========================
                servicio.GuardarPlanillaTurnosEnCarpetaMolinos(
                    archivoPlanilla,
                    filename,
                    "solido"
                );
                if (embarque.Vicentin || embarque.Noryon)
                {
                    servicio.GuardarPlanillaOperacionesEnCarpetaMolinos(archivoPlanilla, filename, false);
                }

                // =========================
                // DEVOLVER ARCHIVO AL FRONT
                // =========================
                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new ByteArrayContent(archivoPlanilla);

                response.Content.Headers.ContentType =
                    new System.Net.Http.Headers.MediaTypeHeaderValue(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );

                response.Content.Headers.ContentDisposition =
                    new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment")
                    {
                        FileName = filename
                    };

                return response;
            }
            catch (Exception e)
            {
                return Request.CreateResponse(
                    HttpStatusCode.InternalServerError,
                    e.Message
                );
            }
        }


        [HttpPost]
        [Autorizacion(PermisosScato.TableroLiquido_GuardarTurno)]
        [Route("api/ModuloDeCarga/GuardarPlanillaTurnoLiquido")]
        public HttpResponseMessage GuardarPlanillaTurnoLiquido(ObjetoPlanillaExcel objetoPlanillaExcel)
        {
            try
            {
                var embarque = servicio.ObtenerEmbarquePorModuloCargaId(objetoPlanillaExcel.IdModuloDeCarga);
                var nombreMuelle = embarque.Vicentin ? " (Vicentin)" : embarque.Noryon ? " (Nouryon)" : "";            
                var filename = embarque.Id + " - " + embarque.Patente + nombreMuelle + ".xlsx";
               
                string subcarpeta = embarque.MaterialesPuertoCantidad.Any(m => m.DescripcionCorta == "BIODIESEL") ? "biodiesel" : "aceite";
                byte[] archivoPlanilla = Convert.FromBase64String(objetoPlanillaExcel.Archivo.Replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,", ""));

                // =========================
                // COMPLETAR DATOS SOLO VICENTIN / NOURYON
                // =========================
                if (embarque.Vicentin || embarque.Noryon)
                {
                    var planillaTurnos =
                        servicio.ObtenerPlanillaDetalleTurnosSolidoCerrados(objetoPlanillaExcel.IdModuloDeCarga);                    

                    var excel = new ExcelPlanillaVicentinNouryonLiquido(
                        archivoPlanilla,
                        planillaTurnos                        
                    );

                    archivoPlanilla = excel.Generar();
                }

                servicio.GuardarPlanillaTurnosEnCarpetaMolinos(archivoPlanilla, filename, subcarpeta);
                if (embarque.Vicentin || embarque.Noryon)
                {
                    servicio.GuardarPlanillaOperacionesEnCarpetaMolinos(archivoPlanilla, filename, true);
                }

                //return Request.CreateResponse(HttpStatusCode.OK);

                // =========================
                // DEVOLVER ARCHIVO AL FRONT
                // =========================
                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new ByteArrayContent(archivoPlanilla);

                response.Content.Headers.ContentType =
                    new System.Net.Http.Headers.MediaTypeHeaderValue(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );

                response.Content.Headers.ContentDisposition =
                    new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment")
                    {
                        FileName = filename
                    };

                return response;
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }


        [HttpPost]
        [Autorizacion(PermisosScato.TableroLiquido_GuardarTurno)]
        [Route("api/ModuloDeCarga/EnviarPlanillaTurnoSolido")]
        public HttpResponseMessage EnviarPlanillaTurnoSolido(int IdModuloDeCarga, ObjetoEnvioPlanillaTurno objetoEnvioPlanillaTurno)
        {
            try
            {
                var resultado = new ResultadoPrevisualizar();
                var resultadoNir = new ResultadoPrevisualizar();
                var docFileNir = "Nir.xls";
                var docFilePlanilla = "Planilla de turnos" + DateTime.Now.ToString("yyyy-MM-dd") + ".xls";
                var nirs = servicio.ObtenerModuloDeCargaNirManualPuerto(IdModuloDeCarga).ToList();
                System.Collections.Generic.List<string> destNir = new System.Collections.Generic.List<string>();

                if (nirs != null && nirs.Any())
                {
                    var path = System.Web.HttpContext.Current.Server.MapPath("~/iconMolinosChiquito.png");
                    byte[] data = File.ReadAllBytes(path);
                    var nombreBuque = servicio.ObtenerBuqueDadoModCarga(IdModuloDeCarga);
                    var generadorExcel = new ExcelNirManual();
                    generadorExcel.GenerarArchivo(resultadoNir, nirs, IdModuloDeCarga, nombreBuque, data);
                }

                if (objetoEnvioPlanillaTurno.mail.Destinatarios != null && objetoEnvioPlanillaTurno.mail.Destinatarios.Any())
                {
                    objetoEnvioPlanillaTurno.mail.Destinatarios.RemoveAll(item => item == null || item == "");
                }
                if (objetoEnvioPlanillaTurno.mail.Copia != null && objetoEnvioPlanillaTurno.mail.Copia.Any())
                {
                    objetoEnvioPlanillaTurno.mail.Copia.RemoveAll(item => item == null || item == "");
                }

                byte[] archivoPlanilla = Convert.FromBase64String(objetoEnvioPlanillaTurno.archivo.Replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,", ""));

                var embarque = servicio.ObtenerEmbarquePorModuloCargaId(IdModuloDeCarga);

                if (embarque.Vicentin || embarque.Noryon)
                {
                    var planillaTurnos =
                    servicio.ObtenerPlanillaDetalleTurnosSolidoCerrados(IdModuloDeCarga);

                    var excel = new ExcelPlanillaVicentinNouryonSolido(
                    archivoPlanilla,
                    planillaTurnos);

                    archivoPlanilla = excel.Generar();
                }

                var envioMail = new EnvioMail
                {
                    Titulo = objetoEnvioPlanillaTurno.mail.Titulo,
                    Cuerpo = objetoEnvioPlanillaTurno.mail.Body,
                    Destinatarios = objetoEnvioPlanillaTurno.mail.Destinatarios,
                    Copia = objetoEnvioPlanillaTurno.mail.Copia,
                    Attachment = archivoPlanilla,
                    AttachmentName = docFilePlanilla,
                };

                if (nirs != null && resultadoNir.Archivo != null)
                {
                    envioMail.Attachment2 = resultadoNir.Archivo;
                    envioMail.AttachmentName2 = docFileNir;
                }

                var res = comandos.Ejecutar(envioMail);

                if (res.HayErrores)
                {
                    throw new Exception("Error al enviar mail: " + res.Errores[""]);
                }
                servicio.EscribirLog($"Envio de planilla de solidos recibidores OK, ejecutado por: {base.nombreUsuario}", TipoLog.Info, "Controller: ModuloDeCarga, EnviarPlanillaTurnoSolido");

                var objetoPlanillaExcel = new ObjetoPlanillaExcel
                {
                    IdModuloDeCarga = IdModuloDeCarga,
                    Archivo = objetoEnvioPlanillaTurno.archivo,
                    EsLiquido = false
                };

                this.GuardarPlanillaTurnoSolido(objetoPlanillaExcel);

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                servicio.EscribirLog($"Hubo un error al intentar enviar la planilla de solidos recibidores, ejecutado por: {base.nombreUsuario}", TipoLog.Error, "Controller: ModuloDeCarga, EnviarPlanillaTurnoSolido", e.Message);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/ListarHorariosExportador")]
        public HttpResponseMessage ListarHorariosExportador(int moduloDeCargaId)
        {
            try
            {
                var horarios = servicio.ListarHorariosExportador(moduloDeCargaId);
                return Request.CreateResponse(HttpStatusCode.OK, horarios);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/ModuloDeCarga/ObtenerHorarioExportador")]
        public HttpResponseMessage ObtenerHorarioExportador(int id)
        {
            try
            {
                var horario = servicio.ObtenerHorarioExportador(id);
                return Request.CreateResponse(HttpStatusCode.OK, horario);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPut]
        [Route("api/ModuloDeCarga/EditarHorarioExportador")]
        public HttpResponseMessage EditarHorarioExportador(EdicionHorarioExportador obj)
        {
            var resultado = comandos.Ejecutar(new EditarHorarioExportador { Obj = obj, Usuario = base.nombreUsuario });
            if (resultado.HayErrores)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, resultado.Errores[""]);
            }
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        [Route("api/ModuloDeCarga/EnviarMail")]
        public HttpResponseMessage EnviarMail(MailDto mail)
        {
            try
            {
                var response = comandos.Ejecutar(new EnvioMail
                {
                    Titulo = mail.Titulo,
                    Destinatarios = mail.Destinatarios,
                    Copia = mail.Copia,
                    Cuerpo = mail.Body
                });

                if (response.HayErrores)
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError, response.Errores[""]);
                }

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }


        [HttpGet]
        [Route("api/ModuloDeCarga/ObtenerFumigacionBodega")]
        public HttpResponseMessage ObtenerFumigacionBodega(int modCargaId)
        {
            try
            {
                var bodegas = servicio.ObtenerFumigacionBodega(modCargaId);
                return Request.CreateResponse(HttpStatusCode.OK, bodegas);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/ModuloDeCarga/GuardarFumigacion")]
        public HttpResponseMessage GuardarFumigacion(FumigacionBodegaDto dto)
        {
            try
            {
                servicio.MarcarFumigacionBodegas(dto);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpGet]        
        [Route("api/ModuloDeCarga/ObtenerEmbarqueIdPorModuloDeCarga")]
        public HttpResponseMessage ObtenerEmbarqueIdPorModuloDeCarga(int ModuloDeCargaId)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerIdEmbarque(ModuloDeCargaId));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }
    }
}