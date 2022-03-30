using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using Molinos.Scato.WebPuertoApi.EXCEL;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class ModuloDeCargaController : BaseController
    {
        private readonly IServicioComandos comandos;

        public ModuloDeCargaController(IServicioActividadFactory<IIngresarEmbarqueService> factory,
            IServicioRepositorio servicio, IServicioComandos comandos) : base(servicio)
        {
            this.comandos = comandos;
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ListarSentidoManoDeEmbarques")]
        public HttpResponseMessage ListarSentidoManoDeEmbarques()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarSentidoManoDeEmbarques());
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ListarCeldaManoDeEmbarques")]
        public HttpResponseMessage ListarCeldaManoDeEmbarques()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarCeldaManoDeEmbarques());
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarModuloDeCarga")]
        public HttpResponseMessage GuardarModuloDeCarga(ModuloDeCargaDto moduloDeCarga)
        {
            comandos.Ejecutar(new GuardarModuloDeCarga { Dto = moduloDeCarga });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
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
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ListarMotivosDeCorte")]
        public HttpResponseMessage ListarMotivosDeCorte()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarMotivosDeCorte());
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ListarMotivosFallasBalanza")]
        public HttpResponseMessage ListarMotivosFallasBalanza()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarMotivosFallasBalanza());
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ListarTurnoPuerto")]
        public HttpResponseMessage ListarTurnoPuerto()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarTurnoPuerto());
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ObtenerCantidadCubitacionDeTanques")]
        public HttpResponseMessage ObtenerCantidadCubitacionDeTanques(string tk, double altura)
        {
            return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerCantidadCubitacionDeTanques(tk, altura)
            );
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ObtenerLlenadoMilimetroPorTanque")]
        public HttpResponseMessage ObtenerLlenadoMilimetroPorTanque(int cm, int mm, string tanqueNum)
        {
            try
            {

                if (tanqueNum.Length > 2)
                    tanqueNum = tanqueNum.Substring(1, 2);

                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerLlenadoMilimetroPorTanque(cm.ToString(), mm.ToString(), "TQ"+tanqueNum));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
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
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ActualizarEstadoBuque")]
        public HttpResponseMessage ActualizarEstadoBuque(int Embarque_Id, int Estado)
        {
            servicio.ActualizarEstadoBuque(Embarque_Id, Estado);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarModuloDeCargaUmap")]
        public HttpResponseMessage GuardarModuloDeCargaUmap(List <ModuloDeCargaUmapDto> moduloDeCargaUmaps, int ModuloDeCarga_Id)
        {
            servicio.GuardarModuloDeCargaUmap(moduloDeCargaUmaps, ModuloDeCarga_Id);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarPeriodoDeCarga")]
        public HttpResponseMessage GuardarPeriodoDeCarga(ModuloDeCargaPeriodoDeCargaDto moduloDeCargaPeriodoDeCargaDto, int moduloDeCarga_Id)
        {
            
            servicio.GuardarPeriodoDeCarga(moduloDeCargaPeriodoDeCargaDto, moduloDeCarga_Id);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarPlanillaDeEmbarque")]
        public HttpResponseMessage GuardarPlanillaDeEmbarque(List<ModuloDeCargaPlanillaDeEmbarqueDto> planillaDeEmbarqueDtos, int idModuloDeCarga)
        {
            try
            {
                foreach (var item in planillaDeEmbarqueDtos)
                {
                    comandos.Ejecutar(new GuardarPlanillaDeEmbarque { Dto = item, IdModuloDeCarga = idModuloDeCarga });
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
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarModuloDeCargaNirManualPuerto")]
        public HttpResponseMessage GuardarModuloDeCargaNirManualPuerto(List<ModuloDeCargaNirManualPuertoDto> moduloDeCargaNirsManualPuerto, int ModuloDeCarga_Id)
        {
            servicio.GuardarModuloDeCargaNirManualPuerto(moduloDeCargaNirsManualPuerto, ModuloDeCarga_Id);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ObtenerDestinatariosPlanillaTurnos")]
        public HttpResponseMessage ObtenerDestinatariosPlanillaTurnos()
        {
            try
            {
                string destinatarios = servicio.obtenerDireccionesDeMail("PlanillaDeTurnos");
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
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ObtenerModuloDeCargaPlanillaDeTurnos")]
        public HttpResponseMessage ObtenerModuloDeCargaPlanillaDeTurnos(int turnoPuerto_id, int moduloDeCarga_id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerModuloDeCargaPlanillaDeTurnos(turnoPuerto_id, moduloDeCarga_id));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }



        }       


        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarTurnoPlanillaDeTurnos")]
        public HttpResponseMessage GuardarTurnoPlanillaDeTurnos(int IdModuloDeCarga, ModuloDeCargaPlanillaDeTurnosDto turnos)
        {
            try
            {
                var resultado = new ResultadoPrevisualizar();
                comandos.Ejecutar(new GuardarPlanillaDeTurnos { Dto = turnos, IdModuloDeCarga = IdModuloDeCarga });

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
            }
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarPlanillaDeTurnosMail")]
        public HttpResponseMessage GuardarPlanillaDeTurnosMail(int IdModuloDeCarga,  ObjetoMail ObjetoMail)
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
        [Route("api/ModuloDeCarga/SincronizarBalanzasCortes")]
        public HttpResponseMessage SincronizarBalanzasCortes(int IdModuloDeCarga)
        {
            try
            {
                 comandos.Ejecutar(new SincronizarBalanzasCortes { IdModuloDeCarga = IdModuloDeCarga });

                CortesRegistrados cor = new CortesRegistrados()
                {
                    balanzas = servicio.ObtenerCortesBalanzas(IdModuloDeCarga),
                    informacionAdicional = servicio.ObtenerInformacionCortesBalanzas(IdModuloDeCarga)

                };
         
                return Request.CreateResponse(HttpStatusCode.OK, cor);
            }
            catch (Exception ex )
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        public class CortesRegistrados
        {
            public IList<BalanzasCortesDto> balanzas { get; set; }
            public Dictionary<string, string> informacionAdicional { get; set; }
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/EliminarCorteBalanza")]
        public HttpResponseMessage EliminarCorteBalanza(int idCorteBalanza)
        {
            try
            {
                servicio.EliminarCorteBalanza(idCorteBalanza);

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
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarFechaInicioCarga")]
        public HttpResponseMessage GuardarFechaInicioCarga(int embarque_Id, string fechaHorastring)
        {
            DateTime fechaHoraInicioCarga = DateTime.ParseExact(fechaHorastring, "yyyy-MM-dd HH:mm", null);
            servicio.GuardarFechaInicioCarga(embarque_Id, fechaHoraInicioCarga);
            return Request.CreateResponse(HttpStatusCode.OK);
        }


        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/GuardarBalanzaCorte")]
        public HttpResponseMessage GuardarBalanzaCorte(List<BalanzasCortesDto> balanzasCortesDtos)
        {
            servicio.GuardarBalanzaCorte(balanzasCortesDtos);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/ModuloDeCarga/ObtenerRitmos")]
        public HttpResponseMessage ObtenerRitmos(int vapor_id, int modulodecarga_id)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerRitmos(vapor_id, modulodecarga_id));
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
                comandos.Ejecutar(new GuardarLineasDeEmbarque { Dto = lineasDeEmbarque, IdModuloDeCarga = idModuloDeCarga });

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }


        }

        //[HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        //[Route("api/ModuloDeCarga/GuardarObservacionesDeCalidad")]
        //public HttpResponseMessage GuardarObservacionesDeCalidad(int idPlanillaDeTurnos, List<ObservacionesDeCalidadDto> observacionesDeCalidadDto)
        //{
        //    foreach (var dat in observacionesDeCalidadDto)
        //    {
        //        var fecha = dat.Fecha;
        //        var fechaString = fecha.ToString("YYMMDD");
        //        var hora = dat.Hora;
        //        var horaString = hora.ToString("HHMM");
        //        string fechaHoraString = fechaString + " " + horaString;
        //        DateTime fechaHora = DateTime.ParseExact(fechaHoraString, "yyyy-MM-dd HH:mm", null);
        //    }
        //    servicio.GuardarObservacionesDeCalidad(idPlanillaDeTurnos, observacionesDeCalidadDto);
        //    return Request.CreateResponse(HttpStatusCode.OK);
        //}

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
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
        [Autorizacion(PermisosScato.LineUp)]
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

    }
}