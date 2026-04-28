using Molinos.Scato.Dominio.Dto;
using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace Molinos.Scato.WebPuertoApi.Helper
{
    public static class NotificacionFinalizacionOtrosMuelles
    {
        public static MailDto GenerarMail(EmbarqueDto embarque, string direcciones)
        {
            var carga = embarque.OtroMuelleCarga ?? throw new Exception($"No se encontró la carga para el embarque con ID {embarque.Id}");

            string plantillaEmail = string.Empty;
            using (StreamReader reader = new StreamReader(Path.Combine(HttpContext.Current.Server.MapPath("~"), "Plantilla", "Email", "template_finalizacion_otros_muelles.html")))
            {
                plantillaEmail = reader.ReadToEnd();
            }

            var rowsInfo = new StringBuilder();
            foreach (var detalle in carga.OtroMuelleCargaDetalles)
            {
                rowsInfo.AppendLine("<tr>");
                rowsInfo.AppendLine($"<td style='border: 1px solid black; padding: 8px; text-align: left;'>{detalle.Exportador.Nombre}</td>");
                rowsInfo.AppendLine($"<td style='border: 1px solid black; padding: 8px; text-align: left;'>{detalle.MaterialPuerto.Descripcion}</td>");
                rowsInfo.AppendLine($"<td style='border: 1px solid black; padding: 8px; text-align: left;'>{detalle.Destino.Nombre}</td>");
                rowsInfo.AppendLine($"<td style='border: 1px solid black; padding: 8px; text-align: left;'>{detalle.FechaHoraInicio:dd/MM/yyyy HH:mm}</td>");
                rowsInfo.AppendLine($"<td style='border: 1px solid black; padding: 8px; text-align: left;'>{detalle.FechaHoraFin:dd/MM/yyyy HH:mm}</td>");
                rowsInfo.AppendLine($"<td style='border: 1px solid black; padding: 8px; text-align: left;'>{detalle.CantidadTn.ToString("N3", CultureInfo.GetCultureInfo("es-ES"))} TN</td>");
                rowsInfo.AppendLine("</tr>");
            }

            plantillaEmail = plantillaEmail
                .Replace("{nombreBuque}", embarque.Patente)
                .Replace("{rowsInfo}", rowsInfo.ToString())
                .Replace("{observaciones}", carga.Observacion);

            var productos = string.Join(" - ", carga.OtroMuelleCargaDetalles.Select(d => d.MaterialPuerto.Descripcion).Distinct());

            return new MailDto
            {
                Titulo = $"FINAL {embarque.Patente} - {productos} - Muelle {embarque.OtroMuelleNombre}",
                Destinatarios = direcciones.Split(';').Select(d => d.Trim()).Where(d => !string.IsNullOrEmpty(d)).ToList(),
                Body = plantillaEmail
            };
        }
    }
}