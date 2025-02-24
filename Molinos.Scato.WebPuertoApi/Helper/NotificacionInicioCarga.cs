using Molinos.Scato.Actividades.Internas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace Molinos.Scato.WebPuertoApi.Helper
{
    public class NotificacionInicioCarga
    {
        private readonly EmbarqueDto _embarque;
        private readonly ModuloDeCargaPeriodoDeCargaNuevoDto _periodoDeCarga;
        private readonly List<string> _destinatarios;

        public NotificacionInicioCarga(EmbarqueDto embarque, ModuloDeCargaPeriodoDeCargaNuevoDto periodoDeCarga, string destinatarios)
        {
            _embarque = embarque;
            _periodoDeCarga = periodoDeCarga;
            _destinatarios = destinatarios.Split(';').ToList();
        }

        public MailDto GenerarMail()
        {
            return new MailDto
            {
                Titulo = ObtenerTitulo(),
                Destinatarios = _destinatarios,
                Body = ObtenerCuerpo()
            };
        }

        private string ObtenerTitulo()
        {
            List<string> listaMuelles = new List<string>();
            if (_embarque.Vicentin) listaMuelles.Add("Vicentin");
            if (_embarque.OtrosMuelles) listaMuelles.Add("Otros Muelles");
            if (_embarque.Noryon) listaMuelles.Add("Noryon");
            if (_embarque.SanBenito) listaMuelles.Add("San Benito");
            var muelles = string.Join(" - ", listaMuelles);

            List<string> listaProductos = new List<string>();
            foreach (var materialCantidad in _embarque.MaterialesPuertoCantidad)
            {
                listaProductos.Add(materialCantidad.DescripcionCorta);
            }
            var materiales = string.Join(" - ", listaProductos);

            return $"INICIO - {_embarque.Vapor.Nombre} - {materiales} - {muelles}";
        }

        private string ObtenerCuerpo()
        {
            var body = new StringBuilder("<div style=\"font-family: Arial, sans-serif; font-size: 14px;\"><table style=\"border-collapse: collapse; width: 100%;\">");
            body.AppendLine("<thead><tr><th style=\"width:150px; text-align:left; border: 1px solid black;\">INICIO BUQUE</th>");
            body.AppendLine($"<th style=\"text-align:left; border: 1px solid black;\">{_embarque.Vapor.Nombre}</th></tr></thead><tbody>");

            var valores = ObtenerValores();

            foreach (var val in valores)
            {
                body.AppendLine($"<tr><td style=\"border: 1px solid black;\">{val.Key}</td><td style=\"border: 1px solid black;\">{val.Value}</td></tr>");
            }

            body.AppendLine("</tbody></table></div>");

            return body.ToString();
        }

        private Dictionary<string, string> ObtenerValores()
        {
            var valores = new Dictionary<string, string>
            {
                { "Llegó a rada SL", _periodoDeCarga.FechaHoraRada?.ToString("dd/MM/yyyy HH:mm") + "hs" },
                { "Práctico a bordo", _periodoDeCarga.FechaHoraPracticoABordo?.ToString("dd/MM/yyyy HH:mm") + "hs" },
                { "Salió de rada", _periodoDeCarga.FechaHoraSalioDeRada ?.ToString("dd/MM/yyyy HH:mm") + "hs" },
                { "Atracó", _periodoDeCarga.FechaHoraAmarro ?.ToString("dd/MM/yyyy HH:mm") + "hs" },
                { "Habilitó", _periodoDeCarga.FechaHoraHabilitacion ?.ToString("dd/MM/yyyy HH:mm") + "hs" }
            };

            if (_embarque.EsLiquido)
            {
                valores.Add("Conectó", _periodoDeCarga.FechaHoraConexionMangueras?.ToString("dd/MM/yyyy HH:mm" + "hs"));
            }

            valores.Add("Comenzó carga", _periodoDeCarga.FechaHoraComienzoCarga?.ToString("dd/MM/yyyy HH:mm") + "hs");
            valores.Add("Viento", $"{_periodoDeCarga.VientoAmarro} KM/H {_periodoDeCarga.DireccionAmarro.ToUpper()}");

            return valores;
        }
    }
}