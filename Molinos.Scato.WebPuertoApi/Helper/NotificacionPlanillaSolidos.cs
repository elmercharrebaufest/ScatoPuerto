using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace Molinos.Scato.WebPuertoApi.Helper
{
    public class NotificacionPlanillaSolidos
    {
        private ModuloDeCargaDto _modulo;
        private EmbarqueDto _embarque;
        private IList<PlanoDeCargaBodegaDto> _cargasPlano;
        private List<int> _idsOcultos;

        public NotificacionPlanillaSolidos(ModuloDeCargaDto modulo, EmbarqueDto embarque, IList<PlanoDeCargaBodegaDto> cargasPlano, List<int> idsOcultos)
        {
            _modulo = modulo;
            _embarque = embarque;
            _cargasPlano = cargasPlano;
            _idsOcultos = idsOcultos;
        }

        public string GenerarCuerpoEmail()
        {
            string plantillaEmail = string.Empty;
            StringBuilder plantillaDetalle = new StringBuilder();

            using (StreamReader reader = new StreamReader(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~"), "Plantilla", "Email", "template_planilla_solidos.html")))
                plantillaEmail = reader.ReadToEnd();

            plantillaEmail = plantillaEmail.Replace("#buque", ObtenerNombreBuque());
            plantillaEmail = plantillaEmail.Replace("#totalTurno", ObtenerTotalTurno().ToString("F3") + " TN");
            plantillaEmail = plantillaEmail.Replace("#totalCargado", ObtenerTotalCargado().ToString("F3") + " TN");
            plantillaEmail = plantillaEmail.Replace("#pedidoPorPlano", ObtenerTotalPlano().ToString("F3") + " TN");
            plantillaEmail = plantillaEmail.Replace("#restaEmbarcar", ObtenerRestaEmbarcar().ToString("F3") + " TN");
            plantillaEmail = plantillaEmail.Replace("#viento", "");

            var sbRecords = new StringBuilder();
            var planilla = _modulo.ModuloDeCargaPlanillaDeTurnos.OrderBy(x => x.Fecha).ThenBy(x => x.TurnoPuerto.Orden);

            foreach (ModuloDeCargaPlanillaDeTurnosDto turno in planilla)
            {
                var cortes = turno.ModuloDeCargaPlanillaDeTurnosCortes;
                if (_idsOcultos != null && _idsOcultos.Any())
                    cortes = cortes.Where(x => !_idsOcultos.Contains(x.Id)).ToList();

                foreach (ModuloDeCargaPlanillaDeTurnosCortesDto corte in cortes)
                {
                    sbRecords.AppendFormat("<tr>");
                    sbRecords.AppendFormat("<td style=\"border: 1px solid black; padding: 8px;\">{0}</td>", turno.Fecha.Value.ToString("dd-MM-yyyy"));
                    sbRecords.AppendFormat("<td style=\"border: 1px solid black; padding: 8px;\">{0}</td>", ObtenerTurno(corte.HoraInicio, corte.HoraFin));
                    sbRecords.AppendFormat("<td style=\"border: 1px solid black; padding: 8px;\">{0}</td>", corte.Observaciones);
                    sbRecords.AppendFormat("</tr>");
                }
            }

            plantillaEmail = plantillaEmail.Replace("{Registros}", sbRecords.ToString());

            return plantillaEmail;
        }

        private string ObtenerNombreBuque()
        {
            return _embarque.Vapor.Nombre;
        }

        private decimal ObtenerTotalTurno()
        {
            decimal totalTn = 0;
            var ultimoTurno = _modulo.ModuloDeCargaPlanillaDeTurnos.OrderBy(x => x.Fecha).ThenBy(x => x.TurnoPuerto.Orden).Last();
            totalTn = ultimoTurno.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Sum(x => x.Cantidad / 1000);
            return totalTn;
        }

        private decimal ObtenerTotalCargado()
        {
            decimal totalCargado = 0;
            foreach (ModuloDeCargaPlanillaDeTurnosDto turno in _modulo.ModuloDeCargaPlanillaDeTurnos)
            {
                foreach (ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto carga in turno.ModuloDeCargaPlanillaDeTurnosDetallesSolido)
                {
                    totalCargado += carga.Cantidad / 1000;
                }
            }
            return totalCargado;
        }

        private decimal ObtenerTotalPlano()
        {
            decimal total = 0;
            foreach (PlanoDeCargaBodegaDto carga in _cargasPlano)
            {
                if (carga.Cantidad != null)
                {
                    total += ((int)carga.Cantidad*1000) / 1000;
                }
            }
            return total;
        }

        private decimal ObtenerRestaEmbarcar()
        {
            return ObtenerTotalPlano() - ObtenerTotalCargado();
        }

        private string ObtenerTurno(string horaInicio, string horaFin)
        {
            TimeSpan inicioHora = TimeSpan.Parse(horaInicio);
            TimeSpan finHora = TimeSpan.Parse(horaFin);
            if (inicioHora >= TimeSpan.FromHours(0) && finHora <= TimeSpan.FromHours(6))
            {
                return "00 a 06 hs";
            }
            else if (inicioHora >= TimeSpan.FromHours(6) && finHora <= TimeSpan.FromHours(12))
            {
                return "06 a 12 hs";
            }
            else if (inicioHora >= TimeSpan.FromHours(12) && finHora <= TimeSpan.FromHours(18))
            {
                return "12 a 18 hs";
            }
            else if (inicioHora >= TimeSpan.FromHours(18) && finHora <= TimeSpan.FromHours(24))
            {
                return "18 a 24 hs";
            }
            else return "-";
        }
    }
}