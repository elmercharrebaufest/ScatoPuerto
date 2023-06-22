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
        private Timer timer;
        private List<TimeSpan> horariosEnvio = ConfigurationHelper.HorariosEjecucion;

        public EmailService()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            // Obtener la hora actual y calcular el tiempo hasta el próximo horario de envío
            DateTime ahora = DateTime.Now;
            TimeSpan tiempoHastaProximoEnvio = ObtenerTiempoHastaProximoEnvio(ahora);

            // Crear y configurar el temporizador
            timer = new Timer(tiempoHastaProximoEnvio.TotalMilliseconds);
            timer.Elapsed += EnviarCorreoElectronico;
            timer.AutoReset = true;
            timer.Enabled = true;
        }

        protected override void OnStop()
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
                        // El correo electrónico se envió correctamente
                    }
                    else
                    {
                        // Hubo un error al enviar el correo electrónico
                    }
                }
                catch (Exception ex)
                {
                    // Manejar cualquier excepción que pueda ocurrir durante la solicitud
                    Console.WriteLine("Error al enviar el correo electrónico: " + ex.Message);
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
