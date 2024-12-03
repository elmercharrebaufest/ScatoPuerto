using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace Molinos.Scato.WebPuertoApi.Helper
{
    public class NotificacionPlanillaLiquidos
    {
        private IList<HorariosExportadorDto> _horariosExportador;

        public NotificacionPlanillaLiquidos(IList<HorariosExportadorDto> horarios)
        {
            _horariosExportador = horarios;
        }

        public string GenerarCuerpoEmail()
        {
            string plantillaEmail = string.Empty;
            StringBuilder plantillaDetalle = new StringBuilder();

            using (StreamReader reader = new StreamReader(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~"), "Plantilla", "Email", "template_planilla_liquidos.html")))
                plantillaEmail = reader.ReadToEnd();

            var sbHorarios = new StringBuilder();

            foreach (HorariosExportadorDto horario in _horariosExportador)
            {
                sbHorarios.AppendFormat("<tr>");
                sbHorarios.AppendFormat("<td style=\"border: 1px solid black; padding: 8px;\">{0}</td>", horario.Exportador?.Nombre);
                sbHorarios.AppendFormat("<td style=\"border: 1px solid black; padding: 8px;\">{0}</td>", horario.Inicio.HasValue ? horario.Inicio.Value.ToString("dd/MM/yyyy HH:mm") + "hs" : "");
                sbHorarios.AppendFormat("<td style=\"border: 1px solid black; padding: 8px;\">{0}</td>", horario.Fin.HasValue ? horario.Fin.Value.ToString("dd/MM/yyyy HH:mm") + "hs" : "");
                sbHorarios.AppendFormat("<td style=\"border: 1px solid black; padding: 8px;\">{0}</td>", horario.Cantidad.ToString() + "Kg");
                sbHorarios.AppendFormat("</tr>");
            }

            plantillaEmail = plantillaEmail.Replace("{Horarios}", sbHorarios.ToString());

            return plantillaEmail;
        }
    }
}