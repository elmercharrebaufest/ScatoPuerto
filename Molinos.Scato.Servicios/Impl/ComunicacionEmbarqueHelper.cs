using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                RegistrarCaratulaRequest1 registrarCaratulaRequest =
                    new RegistrarCaratulaRequest1(
                        new RegistrarCaratulaRequest1Body
                        {
                            argRegistrarCaratula = new RegistrarCaratulaRequest { Caratula = this.conversor.Convertir<AfipCaratulaDto, Caratula>(afipCaratulaDto) },
                            argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa
                        });

                return this.wgescomunicacionembarque.RegistrarCaratula(registrarCaratulaRequest);
            }
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar registrar la Caratula. Error: {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public RectificarCaratulaResponse RectificarCaratula(AfipCaratulaDto afipCaratulaDto)
        {
            try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                RectificarCaratulaRequest1 rectificarCaratulaRequest = new RectificarCaratulaRequest1(
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

                return this.wgescomunicacionembarque.RectificarCaratula(rectificarCaratulaRequest);
            }
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar rectificar la caratula. Error: {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public AnularCaratulaResponse AnularCaratula(string identificadorCaratula)
        {
            try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                AnularCaratulaRequest1 anularCaratulaRequest = new AnularCaratulaRequest1(
                    new AnularCaratulaRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argAnularCaratula = new AnularCaratulaRequest { IdentificadorCaratula = identificadorCaratula }
                    }
                );

                return this.wgescomunicacionembarque.AnularCaratula(anularCaratulaRequest);
            }
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar anular la caratula. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public RegistrarCOEMResponse RegistrarCOEM(AfipCoemDto afipCoemDto)
        {
            try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                RegistrarCOEMRequest1 registrarCOEMRequest1 =
                    new RegistrarCOEMRequest1(
                        new RegistrarCOEMRequest1Body
                        {
                            argRegistrarCOEM = new RegistrarCOEMRequest { IdentificadorCaratula = afipCoemDto.IdentificadorCaratula, Coem = this.conversor.Convertir<AfipCoemDto, Coem>(afipCoemDto) },
                            argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa
                        });
                return this.wgescomunicacionembarque.RegistrarCOEM(registrarCOEMRequest1);
            }
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar registrar la Coem, Error {0} trace {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public RectificarCOEMResponse RectificarCOEM(AfipCoemDto afipCoemDto)
        {
            try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                RectificarCOEMRequest1 rectificarCOEMRequest1 = new RectificarCOEMRequest1(
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
                return this.wgescomunicacionembarque.RectificarCOEM(rectificarCOEMRequest1);
            }
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar rectificar la COEM. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public AnularCOEMResponse AnularCOEM(string identificadorCaratula, string identificadorCOEM)
        {
            try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                AnularCOEMRequest1 anularCOEMRequest1 = new AnularCOEMRequest1(
                    new AnularCOEMRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argAnularCOEM = new AnularCOEMRequest { IdentificadorCaratula = identificadorCaratula, IdentificadorCOEM = identificadorCOEM }
                    });

                return this.wgescomunicacionembarque.AnularCOEM(anularCOEMRequest1);
            }
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar anular la COEM. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public CerrarCOEMResponse CerrarCOEM(string identificadorCaratula, string identificadorCOEM)
        {
            try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                CerrarCOEMRequest1 cerrarCOEMRequest1 = new CerrarCOEMRequest1(
                    new CerrarCOEMRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argCerrarCOEM = new CerrarCOEMRequest { IdentificadorCaratula = identificadorCaratula, IdentificadorCOEM = identificadorCOEM }
                    }
                );

                return this.wgescomunicacionembarque.CerrarCOEM(cerrarCOEMRequest1);
            }
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar Cerrar la COEM. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }

        }

        public SolicitarAnulacionCOEMResponse SolicitarAnulacionCOEM(string identificadorCaratula, string identificadorCOEM)
        {
            try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                SolicitarAnulacionCOEMRequest1 solicitarAnulacionCOEMRequest1 = new SolicitarAnulacionCOEMRequest1(
                    new SolicitarAnulacionCOEMRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argSolicitarAnulacionCOEM = new SolicitarAnulacionCOEMRequest { IdentificadorCaratula = identificadorCaratula, IdentificadorCOEM = identificadorCOEM }
                    });

                return this.wgescomunicacionembarque.SolicitarAnulacionCOEM(solicitarAnulacionCOEMRequest1);
            }
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar Solicitar Anulación de la COEM. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw;
            }
        }

        public SolicitarCierreCargaGranelResponse SolicitarCierreCargaGranel(string identificadorCaratula, DateTime fechaZarpada, string numeroViaje, List<Coem> coems)
        {
            try
            {
                this.cuitRepresentada = 30715118773;
                this.rol = "DEPO";
                this.tipoAgente = "DEPO";
                this.ObtenerAutenticacionEmpresa(cuitRepresentada, rol, tipoAgente);

                SolicitarCierreCargaGranelRequest1 solicitarCierreCargaGranelRequest1 = new SolicitarCierreCargaGranelRequest1(
                    new SolicitarCierreCargaGranelRequest1Body
                    {
                        argWSAutenticacionEmpresa = this.wSAutenticacionEmpresa,
                        argSolicitarCierreCargaGranel = new SolicitarCierreCargaGranelRequest { IdentificadorCaratula = identificadorCaratula, FechaZarpada = fechaZarpada, numeroViaje = numeroViaje, Coems = coems }
                    });
                return this.wgescomunicacionembarque.SolicitarCierreCargaGranel(solicitarCierreCargaGranelRequest1);
            }
            catch (Exception ex)
            {
                this.log.Error(ex, "Error al intentar Solicitar cierre de carga granel. Error {0} trace: {1}", ex.Message, ex.StackTrace);
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
