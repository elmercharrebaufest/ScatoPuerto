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
using Molinos.Scato.Servicios.AfipWebService;

namespace Molinos.Scato.Servicios.Impl
{
    public class AccesoWsCtg : IAccesoWsCtg
    {
        private readonly IServicioComandos servicioComandos;
        private LoginCMS serviceAfip;
        private IRepositorio repositorio;
        private readonly IServicioRepositorio servicioRepositorio;
        public AccesoWsCtg(IServicioComandos servicioComandos, IRepositorio repositorio, LoginCMS serviceAfip, IServicioRepositorio servicio)
        {
            this.servicioComandos = servicioComandos;
            this.repositorio = repositorio;
            this.serviceAfip = serviceAfip;
            this.servicioRepositorio = servicio;
        }
        
        public virtual authType ObtenerAuthType(string cuitRepresentado, Resultado resultado)
        {
            var ticket = Obtener(cuitRepresentado, resultado);
            return new authType
                {
                    cuitRepresentado = Convert.ToInt64(ticket.CuitRepresentado),
                    sign = ticket.Sign,
                    token = ticket.Token
                };
        }

        private TicketAccesoAfip Obtener(string cuitRepresentado, Resultado resultado)
        {
            //Obtengo el ultimo token creado
            var ticketDeAcceso = repositorio.Listar<TicketAccesoAfip>(x => x.Service == "wsctg" && x.ExpirationTime > DateTime.Now).LastOrDefault() ?? GenerarNuevoTicketDeAcceso(cuitRepresentado, resultado);
            return ticketDeAcceso;
        }
        private TicketAccesoAfip GenerarNuevoTicketDeAcceso(string cuitRepresentado, Resultado resultado)
        {
            TicketAccesoAfip ticketNuevo = null;
            try
            {
                ServicePointManager.SecurityProtocol |= SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;

                var xmlLoginTicketRequest = GenerarXmlLoginTicketRequest();
            var cmsFirmadoBase64 = EncriptarXmlLoginTicketRequest(xmlLoginTicketRequest, ConfigurationManager.AppSettings["CertificadoWsCtg"]);

                var ticketDeAcceso = serviceAfip.loginCms(new loginCmsRequest { in0 = cmsFirmadoBase64 });

                var xmlTicketDeAcceso = new XmlDocument();
                xmlTicketDeAcceso.LoadXml(ticketDeAcceso.loginCmsReturn);
                var nodoHeader = xmlTicketDeAcceso.SelectSingleNode("//header");
                var nodoCredentials = xmlTicketDeAcceso.SelectSingleNode("//credentials");

                ticketNuevo = new TicketAccesoAfip
                {
                    CuitRepresentado = cuitRepresentado,
                    ExpirationTime = DateTime.Parse(nodoHeader.SelectSingleNode("//expirationTime").InnerText),
                    GenerationTime = DateTime.Parse(nodoHeader.SelectSingleNode("//generationTime").InnerText),
                    Service = "wsctg",
                    Sign =
                        nodoCredentials.SelectSingleNode("//sign") == null
                            ? ""
                            : nodoCredentials.SelectSingleNode("//sign").InnerText,
                    Token =
                        nodoCredentials.SelectSingleNode("//token") == null
                            ? ""
                            : nodoCredentials.SelectSingleNode("//token").InnerText
                };
                repositorio.Agregar(ticketNuevo);
            }
            catch (Exception e)
            {
                resultado.Errores.Add("", e.Message);
            }
            if (!resultado.HayErrores)
            {
                repositorio.GuardarCambios();
            }
            return ticketNuevo;
        }
        private string EncriptarXmlLoginTicketRequest(XmlDocument xmlLoginTicketRequest, string pathCertificado)
        {
            var certFirmante = new X509Certificate2(AppDomain.CurrentDomain.BaseDirectory + pathCertificado, "", X509KeyStorageFlags.MachineKeySet);

            try
            {
                var vencimiento = DateTime.ParseExact(certFirmante.GetExpirationDateString(), "d/M/yyyy hh:mm:ss", CultureInfo.InvariantCulture);

                var hoy = DateTime.Today.AddDays(10);

                if (hoy >= vencimiento)
                {
                    var soporte = servicioRepositorio.ListarEmailsPorRoles(new List<string>() { "NIVEL 1", "NIVEL 2" });
                    servicioComandos.Ejecutar(new EnvioMail { Destinatarios = soporte, Titulo = "Vencimiento de Certificado", Cuerpo = string.Format(Textos.MailAvisoVencimientoCertificado) });
                }
            }
            catch
            {
            }
            

            // Convierto el login ticket request a bytes, para firmar 
            Encoding encodedMsg = Encoding.UTF8;
            byte[] msgBytes = encodedMsg.GetBytes(xmlLoginTicketRequest.OuterXml);

            // Firmo el msg y paso a Base64 
            // Pongo el mensaje en un objeto ContentInfo (requerido para construir el obj SignedCms) 
            var infoContenido = new ContentInfo(msgBytes);
            var cmsFirmado = new SignedCms(infoContenido);

            // Creo objeto CmsSigner que tiene las caracteristicas del firmante 
            CmsSigner cmsFirmante = new CmsSigner(certFirmante);
            cmsFirmante.IncludeOption = X509IncludeOption.EndCertOnly;

            // Firmo el mensaje PKCS #7 
            cmsFirmado.ComputeSignature(cmsFirmante);

            // Encodeo el mensaje PKCS #7. 
            byte[] encodedSignedCms = cmsFirmado.Encode();

            var cmsFirmadoBase64 = Convert.ToBase64String(encodedSignedCms);
            return cmsFirmadoBase64;
        }
        private static XmlDocument GenerarXmlLoginTicketRequest()
        {
            const string xmlStrLoginTicketRequestTemplate =
                "<loginTicketRequest><header><uniqueId></uniqueId><generationTime></generationTime><expirationTime></expirationTime></header><service></service></loginTicketRequest>";

            var xmlLoginTicketRequest = new XmlDocument();
            xmlLoginTicketRequest.LoadXml(xmlStrLoginTicketRequestTemplate);

            var xmlNodoUniqueId = xmlLoginTicketRequest.SelectSingleNode("//uniqueId");
            var xmlNodoGenerationTime = xmlLoginTicketRequest.SelectSingleNode("//generationTime");
            var xmlNodoExpirationTime = xmlLoginTicketRequest.SelectSingleNode("//expirationTime");
            var xmlNodoService = xmlLoginTicketRequest.SelectSingleNode("//service");

            // Las horas son UTC formato yyyy-MM-ddTHH:mm:ssZ
            xmlNodoGenerationTime.InnerText = DateTime.UtcNow.AddMinutes(-10).ToString("s") + "Z";
            xmlNodoExpirationTime.InnerText = DateTime.UtcNow.AddMinutes(+10).ToString("s") + "Z";
            xmlNodoUniqueId.InnerText = Convert.ToString(1);
            xmlNodoService.InnerText = "wsctg";
            return xmlLoginTicketRequest;
        }
    }
}
