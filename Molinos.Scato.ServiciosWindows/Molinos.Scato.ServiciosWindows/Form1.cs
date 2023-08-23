using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Windows.Forms;
using Molinos.Scato.ServiciosWindows.Utils;
using System.Net.Http;
using System.Timers;
using log4net;

namespace Molinos.Scato.ServiciosWindows
{
    public partial class Form1 : Form
    {

        private System.Timers.Timer timer;
        private List<TimeSpan> horariosEnvio = ConfigurationHelper.HorariosEjecucion;
        private static readonly ILog log = LogManager.GetLogger(typeof(Form1));
        public Form1()
        {
            InitializeComponent();
        }

        private void start_Click(object sender, EventArgs e)
        {
            // Obtener la hora actual y calcular el tiempo hasta el próximo horario de envío
            DateTime ahora = DateTime.Now;
            TimeSpan tiempoHastaProximoEnvio = ObtenerTiempoHastaProximoEnvio(ahora);

            // Crear y configurar el temporizador
            timer = new System.Timers.Timer(tiempoHastaProximoEnvio.TotalMilliseconds);
            timer.Elapsed += EnviarCorreoElectronico;
            timer.AutoReset = true;
            timer.Enabled = true;

        }

        private void stop_Click(object sender, EventArgs e)
        {
            timer.Stop();
            timer.Dispose();
        }


        private void EnviarCorreoElectronico(object sender, ElapsedEventArgs e)
        {
            using (HttpClient client = new HttpClient(new HttpClientHandler { UseDefaultCredentials = true }))
            {
                // Establecer la URL de tu API para enviar correos electrónicos
                string apiUrl = ConfigurationHelper.UrlApi;
                try
                {
                    // Ejecutar la solicitud GET en un contexto sincrónico utilizando Task.Run
                    Task<HttpResponseMessage> responseTask = Task.Run(() => client.GetAsync(apiUrl));

                    // Esperar a que se complete la tarea
                    responseTask.Wait();

                    // Obtener la respuesta de la tarea completada
                    HttpResponseMessage response = responseTask.Result;

                    // Verificar si la solicitud fue exitosa
                    if (response.IsSuccessStatusCode)
                    {
                        log.Info("El E-Mail se ha enviado con exito");
                    }
                    else
                    {
                        log.Error("El E-Mail puede que no se haya enviado. Estado: " + response.StatusCode);
                    }
                }
                catch (Exception ex)
                {
                    log.Error("Error al enviar el correo electrónico: " + ex.Message);
                }
            }

            // Calcular el tiempo hasta el próximo horario de envío
            TimeSpan tiempoHastaProximoEnvio = ObtenerTiempoHastaProximoEnvio(DateTime.Now);

            // Reiniciar el temporizador para el próximo envío
            timer.Interval = tiempoHastaProximoEnvio.TotalMilliseconds;
        }

        private TimeSpan ObtenerTiempoHastaProximoEnvio(DateTime ahora)
        {
            TimeSpan tiempoHastaProximoEnvio = TimeSpan.MaxValue;

            foreach (TimeSpan horario in horariosEnvio)
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
