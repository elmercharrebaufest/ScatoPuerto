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
using System.Configuration;
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
        private readonly IListaDeWorkflows workflows;
        private readonly IServicioRepositorio servicioRepositorio;

        private readonly IServicioActividadFactory<IIngresarEmbarqueService> factory;

        public ProgramaEmbarqueController(IServicioActividadFactory<IIngresarEmbarqueService> factory, IServicioRepositorio servicio,
            IServicioProgramaEmbarque servicioProgramaEmbarque,
            IServicioComandos comandos,
            IListaDeWorkflows workflows) : base(servicio, servicioProgramaEmbarque)
        {
            this.factory = factory;
            this.comandos = comandos;
            this.servicioRepositorio = servicio;
            this.workflows = workflows;
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
        public HttpResponseMessage TieneAuditoria([FromBody]int[] nominaciones_id)
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
                foreach(var programaEmbarqueNominacion in nominacionesEnvioLineUpDto.ListaNominaciones)
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
                return Request.CreateResponse(HttpStatusCode.OK, programaEmbarqueResultadoEnvioLineUp);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

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
                Cantidad = nominacion.NominacionDatoTecnico.CantidadTotal,
                DescripcionCorta = nominacion.NominacionDatoTecnico.MaterialPuerto.DescripcionCorta,
                Color = nominacion.NominacionDatoTecnico.MaterialPuerto.Color,
                MaterialId = nominacion.NominacionDatoTecnico.MaterialPuerto.Id,
                EsLiquido = nominacion.NominacionDatoTecnico.MaterialPuerto.EsLiquido
            };
            listaMaterialesPuertoCantidad.Add(materialPuertoCantidad);
            embarqueDto.MaterialesPuertoCantidad = listaMaterialesPuertoCantidad;
            if (nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto.Count > 0)
            {
                var nominacionDatoTecnicoCoordinadorPuerto = nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto.ElementAt(0);
                embarqueDto.Coordinadores = nominacionDatoTecnicoCoordinadorPuerto.CoordinadorPuerto;
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
                observaciones += $"{destino.Destino.Nombre.Trim()} / {destino.Cantidad} tn {Environment.NewLine}";
            }

            observaciones += $"{Environment.NewLine} {Environment.NewLine}";

            observaciones += $"Cargadores: {Environment.NewLine}";

            foreach (var exportador in nominacion.NominacionDatoTecnico.NominacionDatoTecnicoExportador)
            {
                observaciones += $"{exportador.Exportador.Nombre.Trim()} / {exportador.Cantidad} tn {Environment.NewLine}";
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
                var workflowDefinicionId = servicio.ObtenerUltimaWorkflowDefinicionPorCordigo(workflow);
                var servicioWf = factory.CrearServicio(workflowDefinicionId);
                var controlRecorrido = new ControlRecorridoDto
                {
                    Actividad = Textos.ActIngresarEmbarque,
                    ActividadXaml = "IngresarEmbarque",
                    NombreUsuario = nombreUsuario
                };
                var datosEmbarqueAux = servicioWf.IngresarEmbarque(embarqueDto, workflow, workflowDefinicionId, controlRecorrido);
                datosEmbarque = ((ResultadoCrear)datosEmbarqueAux).Id;
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
    }
}
