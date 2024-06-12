using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.AFIP;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using System;
using System.Configuration;

namespace Molinos.Scato.Servicios.Impl
{
    public class ComunicacionEmbarqueServicioHelper : IComunicacionEmbarqueServicioHelper
    {
        private readonly IAccesoComunicacionEmbarque _accesoComunicacionEmbarque;
        private readonly wgescomunicacionembarqueSoap _wgescomunicacionembarque;
        private readonly IConversor _conversor;
        private readonly ILogger _log;
        private readonly IAfipClient _afipClient;
		private readonly IServicioRepositorio _servicioRepositorio;

		private ResponseTicketAccesoAfip ticket;

        private WSAutenticacionEmpresa wSAutenticacionEmpresa;
        private string cuitRepresentada;
        private string rol;
        private string tipoAgente;

        public ComunicacionEmbarqueServicioHelper(
            IAccesoComunicacionEmbarque accesoComunicacionEmbarque,
            wgescomunicacionembarqueSoap wgescomunicacionembarque,
            IConversor conversor,
            ILogger log,
            IAfipClient afipClient,
			IServicioRepositorio servicioRepositorio
		)
        {
            _accesoComunicacionEmbarque = accesoComunicacionEmbarque;
            _wgescomunicacionembarque = wgescomunicacionembarque;
            _conversor = conversor;
            _log = log;
            _afipClient = afipClient;
			_servicioRepositorio = servicioRepositorio;

			rol = "DEPO";
            tipoAgente = "DEPO";
            cuitRepresentada = ConfigurationManager.AppSettings["cuitRepresentada"];
        }

        public RegistrarCaratulaResponse RegistrarCaratula(AfipCaratulaDto afipCaratulaDto)
        {
            _log.Info("Inicializando RegistrarCaratula");
            try
            {
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                RegistrarCaratulaRequest1 request =
                    new RegistrarCaratulaRequest1(
                        new RegistrarCaratulaRequest1Body
                        {
                            argRegistrarCaratula = new RegistrarCaratulaRequest { Caratula = this._conversor.Convertir<AfipCaratulaDto, Caratula>(afipCaratulaDto) },
                            argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa
                        });

                var req = XmlConverter<RegistrarCaratulaRequest1>.Serialize(request);
				_log.Info($" request: { req }");
                var response = this._wgescomunicacionembarque.RegistrarCaratula(request);
				var res = JsonConverter<RegistrarCaratulaResponse>.Serialize(response);
				_log.Info($" response: { res }");
				_servicioRepositorio.GuardarLogAfipCpe("RegistrarCaratula", req, res);
				_log.Info("Finalizando RegistrarCaratula");
                return response;
            }
            catch (Exception ex)
            {
                _log.Error(ex, "Error al intentar registrar la Caratula. Error: {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public RectificarCaratulaResponse RectificarCaratula(AfipCaratulaDto afipCaratulaDto)
        {
            _log.Info("Inicializando RectificarCaratula");
            try
            {
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                RectificarCaratulaRequest1 request = new RectificarCaratulaRequest1(
                    new RectificarCaratulaRequest1Body
                    {
                        argRectificarCaratula = new RectificarCaratulaRequest
                        {
                            Caratula = this._conversor.Convertir<AfipCaratulaDto, Caratula>(afipCaratulaDto),
                            IdentificadorCaratula = afipCaratulaDto.IdentificadorCaratula
                        },
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa
                    }
                );

				var req = XmlConverter<RectificarCaratulaRequest1>.Serialize(request);
				_log.Info($" request: {req}");
                var response = this._wgescomunicacionembarque.RectificarCaratula(request);
				var res = JsonConverter<RectificarCaratulaResponse>.Serialize(response);
				_log.Info($" response: {res}");
				_servicioRepositorio.GuardarLogAfipCpe("RectificarCaratula", req, res);
				_log.Info("Finalizando RectificarCaratula");
                return response;
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar rectificar la caratula. Error: {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public AnularCaratulaResponse AnularCaratula(string identificadorCaratula)
        {
            _log.Info("Inicializando AnularCaratula");
            try
            {
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                AnularCaratulaRequest1 request = new AnularCaratulaRequest1(
                    new AnularCaratulaRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argAnularCaratula = new AnularCaratulaRequest { IdentificadorCaratula = identificadorCaratula }
                    }
                );

				var req = XmlConverter<AnularCaratulaRequest1>.Serialize(request);
				_log.Info($" request: {req}");
                var response = this._wgescomunicacionembarque.AnularCaratula(request);
				var res = JsonConverter<AnularCaratulaResponse>.Serialize(response);
				_log.Info($" response: {res}");
				_servicioRepositorio.GuardarLogAfipCpe("AnularCaratula", req, res);
				_log.Info("Finalizando AnularCaratula");
                return response;
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar anular la caratula. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public SolicitarCambioBuqueResponse SolicitarCambioBuque(AfipSolicitarCambioBuqueDto solicitarCambioBuqueDto, string identificadorCaratula)
        {
            try
            {
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

                return this._wgescomunicacionembarque.SolicitarCambioBuque(solicitarCambioBuqueRequest);
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar solicitar cambio de buque. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw ex;
            }
        }

        public SolicitarCambioFechasResponse SolicitarCambioFechas(AfipSolicitarCambioFechasDto solicitarCambioFechasDto, string identificadorCaratula)
        {
            try
            {
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

                return this._wgescomunicacionembarque.SolicitarCambioFechas(solicitarCambioFechasRequest);
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar solicitar cambio de buque. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw ex;
            }
        }

        public RegistrarCOEMResponse RegistrarCOEM(AfipCoemDto afipCoemDto)
        {
            _log.Info("Inicializando RegistrarCOEM");
            try
            {
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                RegistrarCOEMRequest1 request =
                    new RegistrarCOEMRequest1(
                        new RegistrarCOEMRequest1Body
                        {
                            argRegistrarCOEM = new RegistrarCOEMRequest { IdentificadorCaratula = afipCoemDto.IdentificadorCaratula, Coem = this._conversor.Convertir<AfipCoemDto, Coem>(afipCoemDto) },
                            argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa
                        });

				var req = XmlConverter<RegistrarCOEMRequest1>.Serialize(request);
				_log.Info($" request: {req}");
				var response = this._wgescomunicacionembarque.RegistrarCOEM(request);
				var res = JsonConverter<RegistrarCOEMResponse>.Serialize(response);
				_log.Info($" response: {res}");
				_servicioRepositorio.GuardarLogAfipCpe("RegistrarCOEM", req, res);
				_log.Info("Finalizando RegistrarCOEM");
                return response;
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar registrar la Coem, Error {0} trace {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public RectificarCOEMResponse RectificarCOEM(AfipCoemDto afipCoemDto)
        {
            _log.Info("Inicializando RectificarCOEM");
            try
            {
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                RectificarCOEMRequest1 request = new RectificarCOEMRequest1(
                    new RectificarCOEMRequest1Body
                    {
                        argRectificarCOEM = new RectificarCOEMRequest
                        {
                            IdentificadorCaratula = afipCoemDto.IdentificadorCaratula,
                            IdentificadorCOEM = afipCoemDto.IdentificadorCOEM,
                            Coem = this._conversor.Convertir<AfipCoemDto, Coem>(afipCoemDto)
                        },
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                    });

				var req = XmlConverter<RectificarCOEMRequest1>.Serialize(request);
				_log.Info($" request: {req}");
				var response = this._wgescomunicacionembarque.RectificarCOEM(request);
				var res = JsonConverter<RectificarCOEMResponse>.Serialize(response);
				_log.Info($" response: {res}");
				_servicioRepositorio.GuardarLogAfipCpe("RectificarCOEM", req, res);
				_log.Info("Finalizando RectificarCOEM");
                return response;
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar rectificar la COEM. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public AnularCOEMResponse AnularCOEM(string identificadorCaratula, string identificadorCOEM)
        {
            _log.Info("Inicializando AnularCOEM");
            try
            {
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

				var req = XmlConverter<AnularCOEMRequest1>.Serialize(request);
				_log.Info($" request: {req}");
				var response = this._wgescomunicacionembarque.AnularCOEM(request);
				var res = JsonConverter<AnularCOEMResponse>.Serialize(response);
				_log.Info($" response: {res}");
				_servicioRepositorio.GuardarLogAfipCpe("AnularCOEM", req, res);
				_log.Info("Finalizando AnularCOEM");
                return response;
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar anular la COEM. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public CerrarCOEMResponse CerrarCOEM(string identificadorCaratula, string identificadorCOEM)
        {
            _log.Info("Inicializando CerrarCOEM");
            try
            {
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

				var req = XmlConverter<CerrarCOEMRequest1>.Serialize(request);
				_log.Info($" request: {req}");
				var response = this._wgescomunicacionembarque.CerrarCOEM(request);
				var res = JsonConverter<CerrarCOEMResponse>.Serialize(response);
				_log.Info($" response: {res}");
				_servicioRepositorio.GuardarLogAfipCpe("CerrarCOEM", req, res);
				_log.Info("Finalizando CerrarCOEM");
                return response;
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar Cerrar la COEM. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public SolicitarAnulacionCOEMResponse SolicitarAnulacionCOEM(string identificadorCaratula, string identificadorCOEM)
        {
            _log.Info("Inicializando SolicitarAnulacionCOEM");
            try
            {
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

                var req = XmlConverter<SolicitarAnulacionCOEMRequest1>.Serialize(request);
				_log.Info($" request: {req}");
				var response = this._wgescomunicacionembarque.SolicitarAnulacionCOEM(request);
                var res = JsonConverter<SolicitarAnulacionCOEMResponse>.Serialize(response);
				_log.Info($" response: {res}");
				_servicioRepositorio.GuardarLogAfipCpe("SolicitarAnulacionCOEM", req, res);
				_log.Info("Finalizando SolicitarAnulacionCOEM");
                return response;
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar Solicitar Anulación de la COEM. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public SolicitarCierreCargaGranelResponse SolicitarCierreCargaGranel(AfipSolicitarCierreCargaGranelDto dto)
        {
            _log.Info("Inicializando SolicitarCierreCargaGranel");
            try
            {
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                SolicitarCierreCargaGranelRequest1 request = new SolicitarCierreCargaGranelRequest1(
                    new SolicitarCierreCargaGranelRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argSolicitarCierreCargaGranel = this._conversor.Convertir<AfipSolicitarCierreCargaGranelDto, SolicitarCierreCargaGranelRequest>(dto)
                    });

				var req = XmlConverter<SolicitarCierreCargaGranelRequest1>.Serialize(request);
				_log.Info($" request: {req}");
				var response = this._wgescomunicacionembarque.SolicitarCierreCargaGranel(request);
				var res = JsonConverter<SolicitarCierreCargaGranelResponse>.Serialize(response);
				_log.Info($" response: {res}");
				_servicioRepositorio.GuardarLogAfipCpe("SolicitarCierreCargaGranel", req, res);
				_log.Info("Finalizando SolicitarCierreCargaGranel");
                return response;
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar Solicitar cierre de carga granel. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public SolicitarNoABordoResponse SolicitarNoAbordo(string identificadorCaratula, string identificadorCoem, Declaracion[] identificadoresDeclaracionesMercaderiaSuelta, string codigoMotivo, string descripcionMotivo)
        {
            _log.Info("Inicializando SolicitarNoAbordo");
            try
            {
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

				var req = XmlConverter<SolicitarNoABordoRequest1>.Serialize(request);
				_log.Info($" request: {req}");
				var response = this._wgescomunicacionembarque.SolicitarNoABordo(request);
				var res = JsonConverter<SolicitarNoABordoResponse>.Serialize(response);
				_log.Info($" response: {res}");
				_servicioRepositorio.GuardarLogAfipCpe("SolicitarNoAbordo", req, res);
				_log.Info("Finalizando SolicitarNoAbordo");
                return response;
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar Solicitar No Abordo. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        private void ObtenerAutenticacionEmpresa(string cuitRepresentada, string rol, string tipoAgente)
        {
			_log.Info("Inicializando ObtenerAutenticacionEmpresa");
			if (this.wSAutenticacionEmpresa == null)
            {
                this.ticket = this._afipClient.GetTicketAccesoAfip();

                if (this.ticket != null)
                {
                    WSAutenticacionEmpresa autenticacionEmpresa = new WSAutenticacionEmpresa();
                    autenticacionEmpresa.CuitEmpresaConectada = long.Parse(cuitRepresentada);
                    autenticacionEmpresa.Rol = rol;
                    autenticacionEmpresa.TipoAgente = tipoAgente;
                    autenticacionEmpresa.Token = this.ticket.Data.Token;
                    autenticacionEmpresa.Sign = this.ticket.Data.Sign;
                    this.wSAutenticacionEmpresa = autenticacionEmpresa;
                }
                else
                {
					_log.Error("No se pudo generar el Token de acceso al servicio " + ServiciosAFIP.ComunicacionEmbarque);
					throw new Exception("No se pudo generar el Token de acceso al servicio " + ServiciosAFIP.ComunicacionEmbarque);
                }
            }
			_log.Info("Finalizando ObtenerAutenticacionEmpresa");
		}
    }
}