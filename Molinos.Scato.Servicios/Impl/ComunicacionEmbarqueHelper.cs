using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Impl
{
	public class ComunicacionEmbarqueServicioHelper : IComunicacionEmbarqueServicioHelper
    {
        private IAccesoComunicacionEmbarque accesoComunicacionEmbarque;
        private wgescomunicacionembarqueSoap wgescomunicacionembarque;
        private IConversor conversor;
        private ILogger log;

        private TicketAccesoAfip ticketAccesoAfip;

        private WSAutenticacionEmpresa wSAutenticacionEmpresa;
        private long cuitRepresentada;
        private string rol;
        private string tipoAgente;

        public ComunicacionEmbarqueServicioHelper(IAccesoComunicacionEmbarque accesoComunicacionEmbarque, wgescomunicacionembarqueSoap wgescomunicacionembarque, IConversor conversor, ILogger log)
        {
            this.accesoComunicacionEmbarque = accesoComunicacionEmbarque;
            this.wgescomunicacionembarque = wgescomunicacionembarque;
            this.conversor = conversor;
            this.log = log;
        }

        public RegistrarCaratulaResponse RegistrarCaratula(AfipCaratulaDto afipCaratulaDto)
        {
            log.Info("Inicializando RegistrarCaratula");
			try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                RegistrarCaratulaRequest1 request =
                    new RegistrarCaratulaRequest1(
                        new RegistrarCaratulaRequest1Body
                        {
                            argRegistrarCaratula = new RegistrarCaratulaRequest { Caratula = this.conversor.Convertir<AfipCaratulaDto, Caratula>(afipCaratulaDto) },
                            argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa
                        });

				log.Info($" request: { XmlConverter<RegistrarCaratulaRequest1>.Serialize(request)}");
				var response = this.wgescomunicacionembarque.RegistrarCaratula(request);
				log.Info($" response: { JsonConverter<RegistrarCaratulaResponse>.Serialize(response) }");
				log.Info("Finalizando RegistrarCaratula");
				return response;
            }
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar registrar la Caratula. Error: {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public RectificarCaratulaResponse RectificarCaratula(AfipCaratulaDto afipCaratulaDto)
        {
			log.Info("Inicializando RectificarCaratula");
			try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                RectificarCaratulaRequest1 request = new RectificarCaratulaRequest1(
                    new RectificarCaratulaRequest1Body
                    {
                        argRectificarCaratula = new RectificarCaratulaRequest
                        {
                            Caratula = this.conversor.Convertir<AfipCaratulaDto, Caratula>(afipCaratulaDto),
                            IdentificadorCaratula = afipCaratulaDto.IdentificadorCaratula
                        },
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa
                    }
                );

				log.Info($" request: { XmlConverter<RectificarCaratulaRequest1>.Serialize(request)} ");
				var response = this.wgescomunicacionembarque.RectificarCaratula(request);
				log.Info($" response: { JsonConverter<RectificarCaratulaResponse>.Serialize(response) }");
				log.Info("Finalizando RectificarCaratula");
				return response;
			}
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar rectificar la caratula. Error: {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public AnularCaratulaResponse AnularCaratula(string identificadorCaratula)
        {
			log.Info("Inicializando AnularCaratula");
			try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                AnularCaratulaRequest1 request = new AnularCaratulaRequest1(
                    new AnularCaratulaRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argAnularCaratula = new AnularCaratulaRequest { IdentificadorCaratula = identificadorCaratula }
                    }
                );

				log.Info($" request: { XmlConverter<AnularCaratulaRequest1>.Serialize(request) } ");
				var response = this.wgescomunicacionembarque.AnularCaratula(request);
				log.Info($" response: { JsonConverter<AnularCaratulaResponse>.Serialize(response) }");
				log.Info("Finalizando AnularCaratula");
				return response;
			}
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar anular la caratula. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public SolicitarCambioBuqueResponse SolicitarCambioBuque(AfipSolicitarCambioBuqueDto solicitarCambioBuqueDto, string identificadorCaratula)
        {
            try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                SolicitarCambioBuqueRequest1 solicitarCambioBuqueRequest = new SolicitarCambioBuqueRequest1(
                        new SolicitarCambioBuqueRequest1Body
                        {
                            argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                            argSolicitarCambioBuque = new SolicitarCambioBuqueRequest
                            {
                                IdentificadorBuque = solicitarCambioBuqueDto.IdentificadorBuque,
                                NombreMedioTransporte = solicitarCambioBuqueDto.NombreMedioTransporte,
                                IdentificadorCaratula = identificadorCaratula
                            }
                        }
                );

                return this.wgescomunicacionembarque.SolicitarCambioBuque(solicitarCambioBuqueRequest);
            }
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar solicitar cambio de buque. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw ex;
            }
        }

        public SolicitarCambioFechasResponse SolicitarCambioFechas(AfipSolicitarCambioFechasDto solicitarCambioFechasDto, string identificadorCaratula)
        {
            try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                var solicitarCambioFechasRequest = new SolicitarCambioFechasRequest1(
                        new SolicitarCambioFechasRequest1Body
                        {
                            argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                            argSolicitarCambioFechas = new SolicitarCambioFechasRequest
                            {
                                FechaArribo = solicitarCambioFechasDto.FechaArribo,
                                FechaZarpada = solicitarCambioFechasDto.FechaZarpada,
                                CodigoMotivo = solicitarCambioFechasDto.CodigoMotivo,
                                DescripcionMotivo = solicitarCambioFechasDto.DescripcionMotivo,
                                IdentificadorCaratula = identificadorCaratula
                            }
                        }
                );

                return this.wgescomunicacionembarque.SolicitarCambioFechas(solicitarCambioFechasRequest);
            }
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar solicitar cambio de buque. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw ex;
            }
        }

        public RegistrarCOEMResponse RegistrarCOEM(AfipCoemDto afipCoemDto)
        {
			log.Info("Inicializando RegistrarCOEM");
			try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                RegistrarCOEMRequest1 request =
                    new RegistrarCOEMRequest1(
                        new RegistrarCOEMRequest1Body
                        {
                            argRegistrarCOEM = new RegistrarCOEMRequest { IdentificadorCaratula = afipCoemDto.IdentificadorCaratula, Coem = this.conversor.Convertir<AfipCoemDto, Coem>(afipCoemDto) },
                            argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa
                        });

				log.Info($" request: { XmlConverter<RegistrarCOEMRequest1>.Serialize(request) } ");
				var response = this.wgescomunicacionembarque.RegistrarCOEM(request);
				log.Info($" response: { JsonConverter<RegistrarCOEMResponse>.Serialize(response) }");
				log.Info("Finalizando RegistrarCOEM");
				return response;
			}
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar registrar la Coem, Error {0} trace {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public RectificarCOEMResponse RectificarCOEM(AfipCoemDto afipCoemDto)
        {
			log.Info("Inicializando RectificarCOEM");
			try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                RectificarCOEMRequest1 request = new RectificarCOEMRequest1(
                    new RectificarCOEMRequest1Body
                    {
                        argRectificarCOEM = new RectificarCOEMRequest
                        {
                            IdentificadorCaratula = afipCoemDto.IdentificadorCaratula,
                            IdentificadorCOEM = afipCoemDto.IdentificadorCOEM,
                            Coem = this.conversor.Convertir<AfipCoemDto, Coem>(afipCoemDto)
                        },
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                    });

				log.Info($" request: { XmlConverter<RectificarCOEMRequest1>.Serialize(request) } ");
				var response = this.wgescomunicacionembarque.RectificarCOEM(request);
				log.Info($" response: { JsonConverter<RectificarCOEMResponse>.Serialize(response) }");
				log.Info("Finalizando RectificarCOEM");
				return response;
			}
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar rectificar la COEM. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public AnularCOEMResponse AnularCOEM(string identificadorCaratula, string identificadorCOEM)
        {
			log.Info("Inicializando AnularCOEM");
			try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                AnularCOEMRequest1 request = new AnularCOEMRequest1(
                    new AnularCOEMRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argAnularCOEM = new AnularCOEMRequest 
                        { 
                            IdentificadorCaratula = identificadorCaratula, 
                            IdentificadorCOEM = identificadorCOEM 
                        }
                    });

				log.Info($" request: {XmlConverter<AnularCOEMRequest1>.Serialize(request)} ");
				var response = this.wgescomunicacionembarque.AnularCOEM(request);
				log.Info($" response: {JsonConverter<AnularCOEMResponse>.Serialize(response)}");
				log.Info("Finalizando AnularCOEM");
				return response;
			}
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar anular la COEM. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public CerrarCOEMResponse CerrarCOEM(string identificadorCaratula, string identificadorCOEM)
        {
			log.Info("Inicializando CerrarCOEM");
			try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                CerrarCOEMRequest1 request = new CerrarCOEMRequest1(
                    new CerrarCOEMRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argCerrarCOEM = new CerrarCOEMRequest 
                        { 
                            IdentificadorCaratula = identificadorCaratula, 
                            IdentificadorCOEM = identificadorCOEM 
                        }
                    }
                );

				log.Info($" request: {XmlConverter<CerrarCOEMRequest1>.Serialize(request)} ");
				var response = this.wgescomunicacionembarque.CerrarCOEM(request);
				log.Info($" response: {JsonConverter<CerrarCOEMResponse>.Serialize(response)}");
				log.Info("Finalizando CerrarCOEM");
				return response;
			}
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar Cerrar la COEM. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }

        }

        public SolicitarAnulacionCOEMResponse SolicitarAnulacionCOEM(string identificadorCaratula, string identificadorCOEM)
        {
			log.Info("Inicializando SolicitarAnulacionCOEM");
			try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                SolicitarAnulacionCOEMRequest1 request = new SolicitarAnulacionCOEMRequest1(
                    new SolicitarAnulacionCOEMRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argSolicitarAnulacionCOEM = new SolicitarAnulacionCOEMRequest 
                        { 
                            IdentificadorCaratula = identificadorCaratula, 
                            IdentificadorCOEM = identificadorCOEM 
                        }
                    });

				log.Info($" request: { XmlConverter<SolicitarAnulacionCOEMRequest1>.Serialize(request)} ");
				var response = this.wgescomunicacionembarque.SolicitarAnulacionCOEM(request);
				log.Info($" response: { JsonConverter<SolicitarAnulacionCOEMResponse>.Serialize(response) }");
				log.Info("Finalizando SolicitarAnulacionCOEM");
				return response;
			}
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar Solicitar Anulación de la COEM. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public SolicitarCierreCargaGranelResponse SolicitarCierreCargaGranel(AfipSolicitarCierreCargaGranelDto dto)
        {
			log.Info("Inicializando SolicitarCierreCargaGranel");
			try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                SolicitarCierreCargaGranelRequest1 request = new SolicitarCierreCargaGranelRequest1(
                    new SolicitarCierreCargaGranelRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argSolicitarCierreCargaGranel = this.conversor.Convertir<AfipSolicitarCierreCargaGranelDto, SolicitarCierreCargaGranelRequest>(dto)
                    });
				log.Info($" request: {XmlConverter<SolicitarCierreCargaGranelRequest1>.Serialize(request)} ");
				var response = this.wgescomunicacionembarque.SolicitarCierreCargaGranel(request);
				log.Info($" response: {JsonConverter<SolicitarCierreCargaGranelResponse>.Serialize(response)}");
				log.Info("Finalizando SolicitarCierreCargaGranel");
				return response;
			}
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar Solicitar cierre de carga granel. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public SolicitarNoABordoResponse SolicitarNoAbordo(string identificadorCaratula, string identificadorCoem, Declaracion[] identificadoresDeclaracionesMercaderiaSuelta, string codigoMotivo, string descripcionMotivo)
        {
			log.Info("Inicializando SolicitarNoAbordo");
			try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                SolicitarNoABordoRequest1 request = new SolicitarNoABordoRequest1(
                    new SolicitarNoABordoRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argSolicitarNoABordo = new SolicitarNoABordoRequest
                        {
                            IdentificadorCaratula = identificadorCaratula,
                            IdentificadorCOEM = identificadorCoem,
                            IdentificadoresDeclaracionesMercaderiaSuelta = identificadoresDeclaracionesMercaderiaSuelta,
                            CodigoMotivo = codigoMotivo,
                            DescripcionMotivo = descripcionMotivo
                        }
                    });
				log.Info($" request: {XmlConverter<SolicitarNoABordoRequest1>.Serialize(request)} ");
				var response = this.wgescomunicacionembarque.SolicitarNoABordo(request);
				log.Info($" response: {JsonConverter<SolicitarNoABordoResponse>.Serialize(response)}");
				log.Info("Finalizando SolicitarNoAbordo");
				return response;
			}
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar Solicitar No Abordo. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        private void ObtenerAutenticacionEmpresa(long cuitRepresentada, string rol, string tipoAgente)
        {
            if (this.wSAutenticacionEmpresa == null || this.ticketAccesoAfip.ExpirationTime < DateTime.Now)
            {
                Resultado resultado = new Resultado();
                this.ticketAccesoAfip = this.accesoComunicacionEmbarque.Obtener(cuitRepresentada.ToString(), resultado, ServiciosAFIP.ComunicacionEmbarque);

                if (this.ticketAccesoAfip != null)
                {
                    WSAutenticacionEmpresa autenticacionEmpresa = new WSAutenticacionEmpresa();
                    autenticacionEmpresa.CuitEmpresaConectada = cuitRepresentada;
                    autenticacionEmpresa.Rol = rol;
                    autenticacionEmpresa.TipoAgente = tipoAgente;
                    autenticacionEmpresa.Token = this.ticketAccesoAfip.Token;
                    autenticacionEmpresa.Sign = this.ticketAccesoAfip.Sign;
                    this.wSAutenticacionEmpresa = autenticacionEmpresa;
                }
                else
                {
                    throw new Exception("No se pudo generar el Token de acceso al servicio " + ServiciosAFIP.ComunicacionEmbarque);
                }
            }
        }
    }
}
