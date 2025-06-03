using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace Molinos.Scato.WebPuertoApi.Helper
{
    public class NotificacionAlertaAdministracion
    {
        private DetalleEmbarqueAFacturarDto _detalle;
        public NotificacionAlertaAdministracion(DetalleEmbarqueAFacturarDto detalle) {
            _detalle = detalle;
        }
        public string GenerarCuerpoEmail()
        {
            string plantillaEmail = string.Empty;
            StringBuilder plantillaDetalle = new StringBuilder();
           
            using (StreamReader reader = new StreamReader(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~"), "Plantilla", "Email", "template_alerta_administracion.html")))
            plantillaEmail = reader.ReadToEnd();


            var tiposFumigacion = "";
            if(this._detalle.FumigacionCur == true) tiposFumigacion += "Curativa, ";
            if (this._detalle.FumigacionPrev == true) tiposFumigacion += "Preventiva, ";

            plantillaEmail = plantillaEmail.Replace("#reqBuque", this._detalle.Buque);
            plantillaEmail = plantillaEmail.Replace("#reqMuelle", this._detalle.Muelle);
            plantillaEmail = plantillaEmail.Replace("#reqCliente", string.Join(", ", this._detalle.Clientes.Select(x => x.Nombre)));
            plantillaEmail = plantillaEmail.Replace("#reqDestino", string.Join(", ", this._detalle.Destinos.Select(x => x.Nombre)));

            var agencias = "";
            if (this._detalle?.Agencias != null)
            {
                agencias+= string.Join(", ", this._detalle.Agencias.Select(x => x.Nombre).Distinct()) +  ", ";
            }
            if(this._detalle?.AdministracionEmbarque?.Agencias != null)
            {
                agencias += string.Join(", ", this._detalle.AdministracionEmbarque.Agencias.Select(x => x.AgenciaMaritimaPuerto.Nombre));
            }
            plantillaEmail = plantillaEmail.Replace("#reqAgencia", agencias);

            plantillaEmail = plantillaEmail.Replace("#reqAta", this._detalle.Ata);
            plantillaEmail = plantillaEmail.Replace("#reqEta", this._detalle.Amarre.Value.ToString("dd/MM/yyyy"));
            plantillaEmail = plantillaEmail.Replace("#reqObligCarga", this._detalle.ObligacionCarga.HasValue? this._detalle.ObligacionCarga.Value.ToString("dd/MM/yyyy"): "");

            var exportadores = "";
            if (this._detalle?.Exportadores != null)
            {
                exportadores += string.Join(", ", this._detalle.Exportadores.Select(x => x.Nombre).Distinct()) + ", ";
            }
            if (this._detalle?.AdministracionEmbarque?.Exportadores != null)
            {
                exportadores += string.Join(", ", this._detalle.AdministracionEmbarque.Exportadores.Select(x => x.Exportador.Nombre));
            }

            plantillaEmail = plantillaEmail.Replace("#reqCargador", exportadores);

            plantillaEmail = plantillaEmail.Replace("#reqTipoFumigacion", tiposFumigacion);
            plantillaEmail = plantillaEmail.Replace("#reqSurveyor", this._detalle.Surveyor);
            plantillaEmail = plantillaEmail.Replace("#reqEstibadoTrimado", this._detalle.EstibadoTrimado? "Si" : "No");

            var sbRecords = new StringBuilder();
            var listaAgrupada = this._detalle.Cargas
                .GroupBy(c => c.MaterialPuerto) 
                .Select(g => new InformacionBuqueDto
                {
                    MaterialPuerto = g.Key, 
                    Tn = g.Sum(x => x.Tn)  
                })
                .ToList();


            foreach (var prod in listaAgrupada)
            {
                sbRecords.AppendFormat("<tr>");
                sbRecords.AppendFormat("<td style=\"border: 1px solid black; padding: 8px;\">{0}</td>", prod.MaterialPuerto);
                sbRecords.AppendFormat("<td style=\"border: 1px solid black; padding: 8px;\">{0}</td>", prod.Tn);
                sbRecords.AppendFormat("</tr>");
            }

            plantillaEmail = plantillaEmail.Replace("{Registros}", sbRecords.ToString());
            return plantillaEmail;

        }
    }
}