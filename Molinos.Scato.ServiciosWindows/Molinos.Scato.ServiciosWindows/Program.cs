using log4net.Config;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Windows.Forms;

namespace Molinos.Scato.ServiciosWindows
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        static void Main()
        {
            string basePath = AppDomain.CurrentDomain.BaseDirectory;
            string configPath = Path.Combine(basePath, "log4net.config");
            XmlConfigurator.Configure(new FileInfo(configPath));
            // Verificar si se debe ejecutar como servicio o en modo de ventana
            if (Environment.UserInteractive)
            {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);

                // Crear una instancia del formulario o ventana principal
                var mainForm = new Form1();

                // Ejecutar la aplicación de Windows Forms
                Application.Run(mainForm);
            }
            else
            {
                ServiceBase[] ServicesToRun;
                ServicesToRun = new ServiceBase[]
                {
                new EmailService()
                };
                ServiceBase.Run(ServicesToRun);
            }
        }
    }
}
