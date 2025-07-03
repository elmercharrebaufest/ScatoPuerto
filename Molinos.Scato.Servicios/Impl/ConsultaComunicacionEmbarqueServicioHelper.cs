using Molinos.Scato.Servicios.AFIP;
using Molinos.Scato.Servicios.AFIPServicioConsultaComunicacionEmbarque;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;
using System;
using System.Configuration;

namespace Molinos.Scato.Servicios.Impl
{
    public class ConsultaComunicacionEmbarqueServicioHelper : IConsultaComunicacionEmbarqueServicioHelper
    {
        private readonly wconscomunicacionembarqueSoap _wconscomunicacionembarque;
        private readonly ILogger _log;
        private readonly IAfipClient _afipClient;

        private ResponseTicketAccesoAfip ticket;

        private WSAutenticacionEmpresa wSAutenticacionEmpresa;
        private readonly string cuitRepresentada;
        private readonly string rol;
        private readonly string tipoAgente;

        public ConsultaComunicacionEmbarqueServicioHelper(
            wconscomunicacionembarqueSoap wconscomunicacionembarque,
            ILogger log,
            IAfipClient afipClient)
        {
            _wconscomunicacionembarque = wconscomunicacionembarque;
            _log = log;
            _afipClient = afipClient;

            rol = ConfigurationManager.AppSettings["Rol"];
            tipoAgente = ConfigurationManager.AppSettings["TipoAgente"];
            cuitRepresentada = ConfigurationManager.AppSettings["cuitRepresentada"];
        }

        private void ObtenerAutenticacionEmpresa()
        {
            _log.Info("Inicializando ObtenerAutenticacionEmpresa para servicio " + ServiciosAFIP.ConsultaComunicacionEmbarque);
            if (this.wSAutenticacionEmpresa == null)
            {
                this.ticket = this._afipClient.GetTicketAccesoAfip(ServiciosAFIP.ConsultaComunicacionEmbarque);

                if (this.ticket != null)
                {
                    WSAutenticacionEmpresa autenticacionEmpresa = new WSAutenticacionEmpresa
                    {
                        CuitEmpresaConectada = long.Parse(cuitRepresentada),
                        Rol = rol,
                        TipoAgente = tipoAgente,
                        Token = this.ticket.Data.Token,
                        Sign = this.ticket.Data.Sign
                    };
                    this.wSAutenticacionEmpresa = autenticacionEmpresa;
                }
                else
                {
                    _log.Error("No se pudo generar el Token de acceso al servicio " + ServiciosAFIP.ConsultaComunicacionEmbarque);
                    throw new Exception("No se pudo generar el Token de acceso al servicio " + ServiciosAFIP.ConsultaComunicacionEmbarque);
                }
            }
            _log.Info("Finalizando ObtenerAutenticacionEmpresa");
        }

        public ResultadoEjecucionOfResultadoEstadoProceso ConsultarEstadosCOEM(string identificadorCaratula)
        {
            this.ObtenerAutenticacionEmpresa();
            try
            {
                var res = _wconscomunicacionembarque.ObtenerConsultaEstadosCOEM(this.wSAutenticacionEmpresa, identificadorCaratula);
                return res;
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar consultar estados de COEMs. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw ex;
            }
        }

        public ResultadoEjecucionOfResultadoSolicitudProceso ConsultarSolicitudes(string identificadorCaratula)
        {
            this.ObtenerAutenticacionEmpresa();
            try
            {
                var res = _wconscomunicacionembarque.ObtenerConsultaSolicitudes(this.wSAutenticacionEmpresa, identificadorCaratula);
                return res;
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar consultar solicitudes. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw ex;
            }
        }

        public ResultadoEjecucionOfResultadoNoAbordoProceso ConsultarNoABordo(string identificadorCaratula)
        {
            this.ObtenerAutenticacionEmpresa();
            try
            {
                var res = _wconscomunicacionembarque.ObtenerConsultaNoAbordo(this.wSAutenticacionEmpresa, identificadorCaratula);
                return res;
            }
            catch (Exception ex)
            {
                this._log.Error(ex, "Error al intentar consultar 'no a bordo'. Error {0} trace: {1}", ex.Message, ex.StackTrace);
                throw ex;
            }
        }
    }
}
