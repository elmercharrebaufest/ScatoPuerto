using System;
using System.Collections.Generic;
using System.Configuration;

namespace Molinos.Scato.ServiciosWindows.Utils
{
    using log4net;
    using System;
    using System.Collections.Generic;
    using System.Configuration;

    public static class ConfigurationHelper
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(ConfigurationHelper));
        public static List<TimeSpan> HorariosEjecucion { get; } = ObtenerHorariosEjecucion();
        public static string UrlApi { get; } = ObtenerUrlApi();

        private static List<TimeSpan> ObtenerHorariosEjecucion()
        {
            List<TimeSpan> horariosEjecucion = new List<TimeSpan>();
            var horariosEjecucionSection = ConfigurationManager.AppSettings;

            for (int i = 0; ; i++)
            {
                string key = $"HorariosEjecucion:{i}";
                string value = horariosEjecucionSection[key];

                if (value == null)
                {
                    break;
                }

                if (TimeSpan.TryParse(value, out TimeSpan horario))
                {
                    horariosEjecucion.Add(horario);
                }
                else
                {
                    log.Error("Formato de fecha invalido. El formato correcto es HH:mm:ss, el valor ingresado: " + value);
                }
            }

            return horariosEjecucion;
        }

        private static string ObtenerUrlApi()
        {
            return ConfigurationManager.AppSettings["UrlApi"];
        }
    }
}
