using System;
using System.Collections.Generic;
using System.Configuration;

namespace Molinos.Scato.ServiciosWindows.Utils
{
    using System;
    using System.Collections.Generic;
    using System.Configuration;

    public static class ConfigurationHelper
    {
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
                    // Manejar error en el formato del horario
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
