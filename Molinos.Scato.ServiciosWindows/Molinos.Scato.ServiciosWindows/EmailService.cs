using log4net;
using Molinos.Scato.ServiciosWindows.Utils;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;
using System.Timers;

namespace Molinos.Scato.ServiciosWindows
{
    public partial class EmailService : ServiceBase
    {
        private Timer timerProgramaEmbarque;
        private Timer timerDocumentos;
        private List<TimeSpan> horariosEnvioProgramaEmbarque = ConfigurationHelper.HorariosEjecucionProgramaEmbarque;
        private TimeSpan horarioEnvioDocumento = ConfigurationHelper.HorarioEjecucionDocumentos;
        private static readonly ILog log = LogManager.GetLogger(typeof(EmailService));

        public EmailService()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            DateTime ahora = DateTime.Now;

            // Configuración y inicio del temporizador para el programa de embarque
            timerProgramaEmbarque = new Timer(CalcularTiempoHastaProximoEnvio(horariosEnvioProgramaEmbarque, ahora).TotalMilliseconds);
            timerProgramaEmbarque.Elapsed += EnviarMailProgramaEmbarque;
            timerProgramaEmbarque.AutoReset = true;
            timerProgramaEmbarque.Enabled = true;

            // Configuración y inicio del temporizador para documentos pendientes
            timerDocumentos = new Timer(CalcularTiempoHastaProximoEnvio(new List<TimeSpan> { horarioEnvioDocumento }, ahora).TotalMilliseconds);
            timerDocumentos.Elapsed += EnviarMailDocumentosPendientes;
            timerDocumentos.AutoReset = true;
            timerDocumentos.Enabled = true;
        }

        protected override void OnStop()
        {
            timerProgramaEmbarque?.Stop();
            timerProgramaEmbarque?.Dispose();

            timerDocumentos?.Stop();
            timerDocumentos?.Dispose();
        }

        private async void EnviarMailProgramaEmbarque(object sender, ElapsedEventArgs e)
        {
            string apiUrl = ConfigurationHelper.UrlApiProgramaEmbarque;
            await EnviarEmail(apiUrl, "Programa de Embarque");

            // Reiniciar el temporizador con el tiempo hasta el próximo horario
            timerProgramaEmbarque.Interval = CalcularTiempoHastaProximoEnvio(horariosEnvioProgramaEmbarque, DateTime.Now).TotalMilliseconds;
        }

        private async void EnviarMailDocumentosPendientes(object sender, ElapsedEventArgs e)
        {
            string apiUrl = ConfigurationHelper.UrlApiDocumentos;
            await EnviarEmail(apiUrl, "Documentos Pendientes");
            timerDocumentos.Interval = CalcularTiempoHastaProximoEnvio(new List<TimeSpan> { horarioEnvioDocumento }, DateTime.Now).TotalMilliseconds;
        }

        private async Task EnviarEmail(string apiUrl, string descripcionLog)
        {
            using (HttpClient client = new HttpClient(new HttpClientHandler { UseDefaultCredentials = true }))
            {
                try
                {
                    var authHeader = ConfigurationHelper.AuthHeader;
                    client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authHeader);
                    HttpResponseMessage response = await client.GetAsync(apiUrl);

                    if (response.IsSuccessStatusCode)
                    {
                        log.Info($"El E-Mail de {descripcionLog} se ha enviado con éxito.");
                    }
                    else
                    {
                        log.Error($"El E-Mail de {descripcionLog} puede que no se haya enviado. Estado: {response.StatusCode}");
                    }
                }
                catch (Exception ex)
                {
                    log.Error($"Error al enviar el correo electrónico de {descripcionLog}: {ex.Message}");
                }
            }
        }

        private TimeSpan CalcularTiempoHastaProximoEnvio(List<TimeSpan> horarios, DateTime ahora)
        {
            TimeSpan tiempoHastaProximoEnvio = TimeSpan.MaxValue;

            foreach (TimeSpan horario in horarios)
            {
                DateTime proximoEnvio = new DateTime(ahora.Year, ahora.Month, ahora.Day, horario.Hours, horario.Minutes, horario.Seconds);

                if (proximoEnvio <= ahora)
                {
                    proximoEnvio = proximoEnvio.AddDays(1);
                }

                TimeSpan tiempoHastaEnvio = proximoEnvio - ahora;

                if (tiempoHastaEnvio < tiempoHastaProximoEnvio)
                {
                    tiempoHastaProximoEnvio = tiempoHastaEnvio;
                }
            }

            return tiempoHastaProximoEnvio;
        }
    }
}
