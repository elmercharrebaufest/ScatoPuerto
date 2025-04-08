using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace Molinos.Scato.WebPuertoApi.Helper
{
    public class NotificacionProgramaEmbarque
    {
        public string GenerarCuerpoEmail(NominacionDto nominacion)
        {           
            string plantillaEmail = string.Empty;
            StringBuilder plantillaDetalle = new StringBuilder();

            using (StreamReader reader = new StreamReader(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~"), "Plantilla", "Email", "template_surveyor_fumigador.html")))
                plantillaEmail = reader.ReadToEnd();

            plantillaEmail = plantillaEmail.Replace("#reqProducto", $"{nominacion.NominacionDatoTecnico?.MaterialPuerto.DescripcionCortaIngles} ({nominacion.NominacionDatoTecnico?.MaterialPuerto.Descripcion.Trim()})");
            plantillaEmail = plantillaEmail.Replace("#reqBuque", nominacion.NominacionDatoTecnico?.VaporInformacion?.NombreBuque);

            var nombreMuelle = nominacion.NominacionDatoTecnico?.MuelleDeCarga?.Descripcion ?? "-";
            if (nombreMuelle == "Otros Muelles" && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.OtroMuelleNombre))
            {
                nombreMuelle = nominacion.NominacionDatoTecnico.OtroMuelleNombre;
            }

            plantillaEmail = plantillaEmail.Replace("#reqMuelle", $"{nombreMuelle}");
            plantillaEmail = plantillaEmail.Replace("#reqBandera", $"{(nominacion.NominacionDatoTecnico?.VaporInformacion != null && nominacion.NominacionDatoTecnico?.VaporInformacion?.Bandera != null && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.VaporInformacion.Bandera.Nombre) ? nominacion.NominacionDatoTecnico?.VaporInformacion?.Bandera.Nombre : "-")}");
            plantillaEmail = plantillaEmail.Replace("#reqLoadingRate", $"{(nominacion.NominacionDatoTecnico?.TasaDeCargaValor != null ? nominacion.NominacionDatoTecnico?.TasaDeCargaValor : 0)} {(nominacion.NominacionDatoTecnico?.TasaDeCarga != null && nominacion.NominacionDatoTecnico?.TasaDeCarga?.Descripcion != null && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.TasaDeCarga?.Descripcion) ? nominacion.NominacionDatoTecnico?.TasaDeCarga?.Descripcion : " - ")}");
            plantillaEmail = plantillaEmail.Replace("#reqAta", $"{(nominacion.NominacionDatoTecnico?.ATAPuerto != null && nominacion.NominacionDatoTecnico?.ATAPuerto?.Nombre != null && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.ATAPuerto?.Nombre) ? nominacion.NominacionDatoTecnico?.ATAPuerto?.Nombre : "-")}");
            if (nominacion.NominacionDatoTecnico!=null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto != null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto.Count > 0)
                plantillaEmail = plantillaEmail.Replace("#reqCliente", $"{string.Join(", ", nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto.Select(x => x.CoordinadorPuerto.Nombre))}");
            else
                plantillaEmail = plantillaEmail.Replace("#reqCliente", $"-");

            plantillaEmail = plantillaEmail.Replace("#reqCalidad", $"{((nominacion.NominacionDatoTecnico?.NominacionDatoTecnicoCalidad != null && nominacion.NominacionDatoTecnico?.NominacionDatoTecnicoCalidad.Count > 0) ? nominacion.NominacionDatoTecnico?.NominacionDatoTecnicoCalidad.FirstOrDefault().CalidadValor?.TipoDeCalidad?.Descripcion.Trim() : "-")}");

            if (nominacion.NominacionDatoTecnico!=null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCalidad != null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCalidad.Count > 0)
            {
                plantillaDetalle = new StringBuilder();
                foreach (var item in nominacion.NominacionDatoTecnico.NominacionDatoTecnicoCalidad)
                {
                    string calidadValor = !string.IsNullOrEmpty(item.CalidadValorEditado) ? item.CalidadValorEditado : item.CalidadValor.Valor;
                    plantillaDetalle.Append($"<tr><td style=\"border: 1px solid #ddd;padding: 8px;\"><strong> {item.CalidadValor.Parametro} </strong> {calidadValor} </td><tr>");
                }
                plantillaEmail = plantillaEmail.Replace("#reqCaldParametroDetalle", plantillaDetalle.ToString());
                plantillaDetalle.Clear();
            }
            else
                plantillaEmail = plantillaEmail.Replace("#reqCaldParametroDetalle", $"-");


            plantillaEmail = plantillaEmail.Replace("#reqObservacionesCalidad", $"{nominacion.NominacionDatoTecnico?.Observaciones}");
            plantillaEmail = plantillaEmail.Replace("#reqObservacionesDatoTecnico", $"{nominacion.NominacionDatoTecnico?.ObservacionesSurveyor}");


            plantillaEmail = plantillaEmail.Replace("#reqToneladas", $"{nominacion.NominacionDatoTecnico?.CantidadTotal.ToString("0.000")}");
            plantillaEmail = plantillaEmail.Replace("#reqDemDesRate", $"u$ {nominacion.NominacionDatoTecnico?.DEM.ToString("n0")} / {nominacion.NominacionDatoTecnico?.DES.ToString("n0")}");
            plantillaEmail = plantillaEmail.Replace("#reqTolerancia", $"{nominacion.NominacionDatoTecnico?.Tolerancia}% +/ -");
            plantillaEmail = plantillaEmail.Replace("#reqAgenciaMaritima", $"{(nominacion.NominacionDatoTecnico?.AgenciaMaritimaPuerto != null && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.AgenciaMaritimaPuerto?.Nombre) ? nominacion.NominacionDatoTecnico?.AgenciaMaritimaPuerto?.Nombre : "-")}");
            plantillaEmail = plantillaEmail.Replace("#reqEtaRecalada", $"{(nominacion.NominacionDatoTecnico?.ETARecalada != null ? nominacion.NominacionDatoTecnico?.ETARecalada.Value.ToString("dd-MM-yyyy") : "-")}");
            plantillaEmail = plantillaEmail.Replace("#reqObligacionCarga", $"{(nominacion.NominacionDatoTecnico?.ObligacionDeCarga != null ? nominacion.NominacionDatoTecnico?.ObligacionDeCarga.Value.ToString("dd-MM-yyyy") : "-")}");

            if (nominacion.NominacionDatoTecnico!=null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoExportador != null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoExportador.Count > 0)
                plantillaEmail = plantillaEmail.Replace("#reqCargador", $"{string.Join(", ", nominacion.NominacionDatoTecnico.NominacionDatoTecnicoExportador.Select(x => x.Exportador.Nombre))}");
            else
                plantillaEmail = plantillaEmail.Replace("#reqCargador", $"-");

            if (nominacion.NominacionDatoTecnico != null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoDestino != null && nominacion.NominacionDatoTecnico.NominacionDatoTecnicoDestino.Count > 0)
                plantillaEmail = plantillaEmail.Replace("#reqDestino", $"{string.Join(", ", nominacion.NominacionDatoTecnico.NominacionDatoTecnicoDestino.Select(x => x.Destino.Nombre))}");

            else
                plantillaEmail = plantillaEmail.Replace("#reqDestino", $"-");


            plantillaEmail = plantillaEmail.Replace("#reqTipoFumigacion", $"{(nominacion.NominacionDetalleIntervencion != null && nominacion.NominacionDetalleIntervencion?.TipoDeFumigacion != null && !string.IsNullOrEmpty(nominacion.NominacionDetalleIntervencion?.TipoDeFumigacion?.Descripcion) ? nominacion.NominacionDetalleIntervencion?.TipoDeFumigacion?.Descripcion : "-")}");
            plantillaEmail = plantillaEmail.Replace("#reqEstibadoTrimado", $"{((nominacion.NominacionDetalleIntervencion != null && nominacion.NominacionDetalleIntervencion.EstibadorYTrimado == true) ? "SI" : "N/A")}");
            plantillaEmail = plantillaEmail.Replace("#reqSurveyor", $"{(nominacion.NominacionDatoTecnico?.Surveyor != null && !string.IsNullOrEmpty(nominacion.NominacionDatoTecnico?.Surveyor?.Descripcion) ? nominacion.NominacionDatoTecnico?.Surveyor?.Descripcion : "-")}");
            plantillaEmail = plantillaEmail.Replace("#reqDraftSurvey", $"{((nominacion.NominacionDetalleIntervencion != null && nominacion.NominacionDetalleIntervencion.DraftSurvey) ? "SI" : "NO")}");
            plantillaEmail = plantillaEmail.Replace("#reqObservacionesFumigador", $"{nominacion.NominacionDetalleIntervencion.Observaciones}");
            plantillaEmail = plantillaEmail.Replace("#reqPrecintadoBodega", nominacion.NominacionDetalleIntervencion?.Precintado == true ? "SI" : "NO");

            if (nominacion.NominacionDetalleIntervencion != null && nominacion.NominacionDetalleIntervencion.Senasa != null && nominacion.NominacionDetalleIntervencion.Senasa.Count > 0)
            {
                foreach (var item in nominacion.NominacionDetalleIntervencion.Senasa)
                {
                    plantillaDetalle.Append($"<tr style=\"border: text-align:center;\">");
                    plantillaDetalle.Append($"<td style=\"border: 1px solid #ddd;padding: 5px;\"> {item.Exportador.Nombre} </td>");
                    plantillaDetalle.Append($"<td style=\"border: 1px solid #ddd;padding: 5px;\"> {(item.TieneSenasa ? "SI" : "NO")} </td>");
                    plantillaDetalle.Append($"<td style=\"border: 1px solid #ddd;padding: 5px;\"> {(item.IP ? "SI" : "NO")} </td>");
                    plantillaDetalle.Append($"<td style=\"border: 1px solid #ddd;padding: 5px;\">{(item.MuestraOficial ? "SI" : "NO")} </td></tr>");
                    plantillaDetalle.Append($"<tr style=\"border: text-align:center;\">");
                    plantillaDetalle.Append($"<td style=\"border: 1px solid #ddd;padding: 5px;\"> Observaciones </td>");
                    var observaciones = string.IsNullOrEmpty(item.Observaciones) ? "-" : item.Observaciones;
                    plantillaDetalle.Append($"<td colspan=\"3\" style=\"border: 1px solid #ddd;padding: 5px;\"> {observaciones} </td></tr>");
                }
                plantillaEmail = plantillaEmail.Replace("#reqDetalleIntervencion", $"{plantillaDetalle.ToString()}");
                plantillaDetalle.Clear();

            }
            else
            {
                plantillaEmail = plantillaEmail.Replace("#reqDetalleIntervencion", string.Empty);
            }


            if (nominacion.NominacionRecibo != null && nominacion.NominacionRecibo.Count > 0)
            {
                plantillaDetalle.Append($"<label><strong>RECIBO</strong></label>");
                plantillaDetalle.Append($"<table style=\"font-family: Arial, Helvetica, sans-serif; border-collapse: collapse; width: 100%;\">");

                foreach (var item in nominacion.NominacionRecibo)
                {
                    plantillaDetalle.Append($" <tr>");
                    plantillaDetalle.Append($"<tr><td style=\"border: 1px solid #ddd);padding: 8px);\"> <strong> {item.Exportador.Nombre}</strong></td>");
                    plantillaDetalle.Append($"<td style=\"border: 1px solid #ddd);padding: 8px);\"><strong>CANTIDAD (Tn)</strong>:   {(item.Unidad == "Kg" ? ((int)item.Cantidad).ToString() : item.Cantidad.ToString("0.000"))} </br>");
                    plantillaDetalle.Append($"<strong>FORMATO/UNIDAD</strong>:  {item.Formato}/{item.Unidad} </br>");
                    plantillaDetalle.Append($"<strong>AJUSTE</strong>:  {item.Ajuste} </br>");
                    plantillaDetalle.Append($"<strong>LOADING PORT</strong>:  {item.PuertoDeCarga} </br>");
                    plantillaDetalle.Append($"<strong>DISCHARGE PORT</strong>:  {item.PuertoDeDescarga} </br>");
                    plantillaDetalle.Append($"<strong>DESCRIPTION OF GOODS</strong>:  {item.DescripcionesBienes} </td></tr>");
                    plantillaDetalle.Append($"</tr>");
                }

                plantillaDetalle.Append("</table>");
                plantillaEmail = plantillaEmail.Replace("#reqRecibosNominacion", $"{plantillaDetalle}");
                plantillaDetalle.Clear();
            }
            else
            {
                plantillaEmail = plantillaEmail.Replace("#reqRecibosNominacion", string.Empty);
            }

            return plantillaEmail;
        }
    }
}