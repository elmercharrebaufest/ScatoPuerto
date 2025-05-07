using System;
using System.Collections.Generic;
using System.Configuration;

namespace Molinos.Scato.ServiciosWindows.Utils
{
    using log4net;
    using System;
    using System.Collections.Generic;
    using System.Configuration;
    using System.Text;

    public static class ConfigurationHelper
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(ConfigurationHelper));
        public static string AuthHeader { get; } = ObtenerAuthHeader();
        public static List<TimeSpan> HorariosEjecucionProgramaEmbarque { get; } = ObtenerHorariosEjecucionProgramaEmbarque();
        public static string UrlApiProgramaEmbarque { get; } = ObtenerUrlApiProgramaEmbarque();
        public static TimeSpan HorarioEjecucionDocumentos { get; } = ObtenerHorarioEjecucionDocumentos();
        public static string UrlApiDocumentos { get; } = ObtenerUrlApiDocumentos();
        public static List<TimeSpan> HorariosEjecucionAFIP { get; } = ObtenerHorariosEjecucionAFIP();
        public static string UrlApiAFIP { get; } = ObtenerUrlApiAFIP();



        private static string ObtenerAuthHeader()
        {
            var username = ConfigurationManager.AppSettings["WebPuertoApiUsername"];
            var password = ConfigurationManager.AppSettings["WebPuertoApiPassword"];
            var authHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
            return authHeader;
        }

        private static List<TimeSpan> ObtenerHorariosEjecucionProgramaEmbarque()
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

        private static string ObtenerUrlApiProgramaEmbarque()
        {
            return ConfigurationManager.AppSettings["UrlApi"];
        }

        private static TimeSpan ObtenerHorarioEjecucionDocumentos()
        {
            var horarioStr = ConfigurationManager.AppSettings["HorarioEjecucionDocumentos"];
            try
            {
                return TimeSpan.Parse(horarioStr);
            }
            catch (Exception e)
            {
                log.Error("Formato de fecha invalido. El formato correcto es HH:mm:ss, el valor ingresado: " + horarioStr);
                throw e;
            }
        }

        private static string ObtenerUrlApiDocumentos()
        {
            return ConfigurationManager.AppSettings["UrlApiDocumentos"];
        }

        private static List<TimeSpan> ObtenerHorariosEjecucionAFIP()
        {
            List<TimeSpan> horariosEjecucion = new List<TimeSpan>();
            var horariosEjecucionSection = ConfigurationManager.AppSettings;

            for (int i = 0; ; i++)
            {
                string key = $"HorariosEjecucionAFIP:{i}";
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

        private static string ObtenerUrlApiAFIP()
        {
            return ConfigurationManager.AppSettings["UrlApiAFIP"];
        }
    }
}
