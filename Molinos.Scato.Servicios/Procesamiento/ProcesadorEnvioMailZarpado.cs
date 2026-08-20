using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorEnvioMailZarpado : ProcesadorComando<EnvioMailZarpado>
    {
        public ProcesadorEnvioMailZarpado(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(EnvioMailZarpado comando)
        {
            var resultado = new Resultado();
            try
            {
                var message = new MailMessage();

                var configuracion = Repositorio.Obtener<ConfiguracionMail>(x => x.TemplateMail == "EmbarqueZarpo") ?? throw new Exception("No se han encontrado destinatarios");
                var destinatarios = configuracion.Direcciones.Split(';').ToList();
                if (destinatarios.Count == 0)
                {
                    throw new Exception("No se han encontrado destinatarios");
                }
                foreach (var email in destinatarios)
                {
                    message.To.Add(new MailAddress(email));
                }

                Embarque embarque;
                LineUp lineUp;

                if (comando.EmbarqueId != 0) // Desde Recibidores/Calidad
                {
                    embarque = Repositorio.Obtener<Embarque>(comando.EmbarqueId);
                    lineUp = Repositorio.Obtener<LineUp>(l => l.Embarque.Id == comando.EmbarqueId);
                }
                else // Desde LineUp
                {
                    lineUp = Repositorio.Obtener<LineUp>(comando.LineUpId);
                    embarque = lineUp?.Embarque;
                }
                if (embarque == null)
                {
                    throw new Exception("No se ha encontrado el embarque");
                }

                var periodo = lineUp.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga.First() ?? throw new Exception("No se ha encontrado el horario de zarpado");
                DateTime dia = periodo.FechaDesamarro ?? throw new Exception("No se ha encontrado la fecha de desamarre");
                if (!TimeSpan.TryParse(periodo.HoraDesamarro, out var hora))
                {
                    hora = TimeSpan.Zero;
                }
                var fecha = dia.Add(hora).ToString("dd/MM/yyyy, hh:mm");
                var nombre = embarque.Vapor.Nombre;

                message.Subject = $"Recordatorio Scatopuerto AFIP - el buque {nombre} zarpó";
                message.Body = $"El buque {nombre} partió el día {fecha}, recordar que cuentan con hasta 48hs hábiles desde su zarpado para presentar la documentación en el módulo de AFIP.";
                message.IsBodyHtml = true;
                using (var smtpClient = new SmtpClient())
                {
                    ServicePointManager.ServerCertificateValidationCallback =
                    delegate (object s

                                , X509Certificate certificate

                                , X509Chain chain

                                , SslPolicyErrors sslPolicyErrors)

                    { return true; };
                    smtpClient.Send(message);
                }
            }
            catch (Exception e)
            {
                Log.Error(e, "Error al enviar mail de zarpado");
                resultado.Error("", e.Message);
            }
            return resultado;
        }
    }
}
