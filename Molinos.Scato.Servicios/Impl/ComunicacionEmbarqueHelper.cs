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
                this.cuitRepresentada = 20040410024;
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
