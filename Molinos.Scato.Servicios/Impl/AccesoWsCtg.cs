using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Security.Cryptography.Pkcs;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Xml;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.AfipCTGWebService;
using Molinos.Scato.Servicios.AfipCPDigitalService;
using Molinos.Scato.Servicios.AfipWebService;
using Ninject.Extensions.Logging;
using Molinos.Scato.Servicios.Enumeradores;

namespace Molinos.Scato.Servicios.Impl
{
    public class AccesoWsCtg : AccesoAFIP, IAccesoWsCtg
    {
        public override string PathCertificado
        {
            get => ConfigurationManager.AppSettings["CertificadoWsCtg"];
        }
        public AccesoWsCtg(IServicioComandos servicioComandos, IRepositorio repositorio, LoginCMS serviceAfip, IServicioRepositorio servicio, ILogger log):
            base(servicioComandos, repositorio, serviceAfip, servicio, log)
        {
        }
        
        public virtual authType ObtenerAuthType(string cuitRepresentado, Resultado resultado)
        {
            var ticket = this.Obtener(cuitRepresentado, resultado, ServiciosAFIP.CTG);
            return new authType
                {
                    cuitRepresentado = Convert.ToInt64(ticket.CuitRepresentado),
                    sign = ticket.Sign,
                    token = ticket.Token
                };
        }
        public virtual Auth ObtenerAuth(string cuitRepresentado, Resultado resultado)
        {
            var ticket = this.Obtener(cuitRepresentado, resultado, ServiciosAFIP.CPE);
            return new Auth
            {
                cuitRepresentada = Convert.ToInt64(ticket.CuitRepresentado),
                sign = ticket.Sign,
                token = ticket.Token
            };
        }       
    }
}
