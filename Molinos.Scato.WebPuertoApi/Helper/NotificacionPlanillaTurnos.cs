using Molinos.Scato.Dominio.Dto;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace Molinos.Scato.WebPuertoApi.Helper
{
    public class NotificacionPlanillaTurnos
    {
        private readonly IList<HorariosExportadorDto> _horariosExportador;
        private readonly EmbarqueDto _embarque;
        private readonly PlanoDeCargaDto _planoDeCarga;
        private readonly ModuloDeCargaDto _moduloDeCarga;
        private readonly ModuloDeCargaPeriodoDeCargaNuevoDto _periodoDeCarga;
        private readonly List<string> _destinatarios;
        private readonly bool _verObservaciones;
        private readonly List<int> _idsOcultos;

        public NotificacionPlanillaTurnos(IList<HorariosExportadorDto> horarios, EmbarqueDto embarque, PlanoDeCargaDto planoDeCarga, ModuloDeCargaDto moduloDeCarga, string destinatarios, bool verObservaciones, ModuloDeCargaPeriodoDeCargaNuevoDto periodoDeCarga, List<int> idsOcultos = null)
        {
            _horariosExportador = horarios;
            _embarque = embarque;
            _planoDeCarga = planoDeCarga;
            _moduloDeCarga = moduloDeCarga;
            _destinatarios = destinatarios.Split(';').ToList();
            _verObservaciones = verObservaciones;
            _periodoDeCarga = periodoDeCarga;
            _idsOcultos = idsOcultos;
        }

        public MailDto GenerarMail()
        {
            return new MailDto
            {
                Titulo = ObtenerTitulo(),
                Destinatarios = _destinatarios,
                Body = GenerarCuerpoEmail()
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

            string asunto;
            if (_periodoDeCarga == null)
            {
                var ultimoTurnoCerrado = _moduloDeCarga.ModuloDeCargaPlanillaDeTurnos.Where(t => t.GuardadoPorRecibidor && t.GuardadoPorTablerista).Last();
                var nombreUltimoTurno = ultimoTurnoCerrado.TurnoPuerto.Nombre.Replace("-", " A ");
                asunto = "TURNO " + nombreUltimoTurno;
            }
            else
            {
                asunto = "FINAL ";
            }

            return $"{asunto} - {_embarque.Vapor.Nombre} - {materiales} - {muelles}";
        }

        private string GenerarCuerpoPeriodos()
        {
            if (this._periodoDeCarga == null)
            {
                return "";
            }

            var tabla = @"<table>
                    <thead>
                        <tr>
                            <th style='border:1px solid black; padding:8px; text-align:left'>FINAL BUQUE</th>
                            <th style='border:1px solid black; padding:8px; text-align:left'>{Buque}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style='border:1px solid black; padding:8px; text-align:left'>Llegó a rada SL</td>
                            <td style='border:1px solid black; padding:8px; text-align:left'>{LlegoRada}</td>
                        </tr>
                        <tr>
                            <td style='border:1px solid black; padding:8px; text-align:left'>Práctico a bordo</td>
                            <td style='border:1px solid black; padding:8px; text-align:left'>{PracticoABordo}</td>
                        </tr>
                        <tr>
                            <td style='border:1px solid black; padding:8px; text-align:left'>Salió de rada</td>
                            <td style='border:1px solid black; padding:8px; text-align:left'>{SalidoDeRada}</td>
                        </tr>
                        <tr>
                            <td style='border:1px solid black; padding:8px; text-align:left'>Atracó</td>
                            <td style='border:1px solid black; padding:8px; text-align:left'>{Amarre}</td>
                        </tr>
                        <tr>
                            <td style='border:1px solid black; padding:8px; text-align:left'>Habilitó</td>
                            <td style='border:1px solid black; padding:8px; text-align:left'>{Habilitacion}</td>
                        </tr>
                        #trConexionMangueras
                        <tr>
                            <td style='border:1px solid black; padding:8px; text-align:left'>Comenzó carga</td>
                            <td style='border:1px solid black; padding:8px; text-align:left'>{InicioCarga}</td>
                        </tr>
                        <tr>
                            <td style='border:1px solid black; padding:8px; text-align:left'>Finalizó carga</td>
                            <td style='border:1px solid black; padding:8px; text-align:left'>{FinCarga}</td>
                        </tr>
                        #trDesconexionMangueras
                        <tr>
                            <td style='border:1px solid black; padding:8px; text-align:left'>Práctico de salida</td>
                            <td style='border:1px solid black; padding:8px; text-align:left'>{PracticoSalida}</td>
                        </tr>
                        <tr>
                            <td style='border:1px solid black; padding:8px; text-align:left'>Desamarró</td>
                            <td style='border:1px solid black; padding:8px; text-align:left'>{Desamarre}</td>
                        </tr>
                        <tr>
                            <td style='border:1px solid black; padding:8px; text-align:left'>Viento</td>
                            <td style='border:1px solid black; padding:8px; text-align:left'>{Viento}</td>
                        </tr>
                    </tbody>
                </table>";

            if (this._embarque.EsLiquido)
            {
                tabla = tabla.Replace("#trConexionMangueras", "<tr><td style='border:1px solid black; padding:8px; text-align:left'>Conexión de mangueras</td><td style='border:1px solid black; padding:8px; text-align:left'>{ConexionMangueras}</td></tr>");
                tabla = tabla.Replace("#trDesconexionMangueras", "<tr><td style='border:1px solid black; padding:8px; text-align:left'>Desconexión de mangueras</td><td style='border:1px solid black; padding:8px; text-align:left'>{DesconexionMangueras}</td></tr>");
                tabla = tabla.Replace("{ConexionMangueras}", _periodoDeCarga.FechaHoraConexionMangueras?.ToString("dd/MM/yyyy HH:mm") + "hs");
                tabla = tabla.Replace("{DesconexionMangueras}", _periodoDeCarga.FechaHoraDesconexionMangueras?.ToString("dd/MM/yyyy HH:mm") + "hs");
            }
            else
            {
                tabla = tabla.Replace("#trConexionMangueras", "");
                tabla = tabla.Replace("#trDesconexionMangueras", "");
            }

            tabla = tabla.Replace("{Buque}", _embarque.Vapor.Nombre);
            tabla = tabla.Replace("{LlegoRada}", _periodoDeCarga.FechaHoraRada?.ToString("dd/MM/yyyy HH:mm") + "hs");
            tabla = tabla.Replace("{PracticoABordo}", _periodoDeCarga.FechaHoraPracticoABordo?.ToString("dd/MM/yyyy HH:mm") + "hs");
            tabla = tabla.Replace("{SalidoDeRada}", _periodoDeCarga.FechaHoraSalioDeRada?.ToString("dd/MM/yyyy HH:mm") + "hs");
            tabla = tabla.Replace("{Amarre}", _periodoDeCarga.FechaHoraAmarro?.ToString("dd/MM/yyyy HH:mm") + "hs");
            tabla = tabla.Replace("{Habilitacion}", _periodoDeCarga.FechaHoraHabilitacion?.ToString("dd/MM/yyyy HH:mm") + "hs");
            tabla = tabla.Replace("{InicioCarga}", _periodoDeCarga.FechaHoraComienzoCarga?.ToString("dd/MM/yyyy HH:mm") + "hs");
            tabla = tabla.Replace("{FinCarga}", _periodoDeCarga.FechaHoraFinalizacionCarga?.ToString("dd/MM/yyyy HH:mm") + "hs");
            tabla = tabla.Replace("{PracticoSalida}", _periodoDeCarga.FechaHoraPracticoSalida?.ToString("dd/MM/yyyy HH:mm") + "hs");
            tabla = tabla.Replace("{Desamarre}", _periodoDeCarga.FechaHoraDesamarro?.ToString("dd/MM/yyyy HH:mm") + "hs");
            tabla = tabla.Replace("{Viento}", _periodoDeCarga.VientoDesamarro + " KM/H " + _periodoDeCarga.DireccionDesamarro.ToUpper());

            return tabla;
        }

        // Los totales dependen de los turnos cerrados.
        private string AgregarCuerpoTotales(string plantillaEmail, IEnumerable<ModuloDeCargaPlanillaDeTurnosDto> turnosCerrados)
        {
            decimal totalCargado;
            decimal totalTurno;

            var buque = _embarque.Vapor.Nombre;

            var totalPlano = _planoDeCarga.PlanoDeCargaBodegas.Sum(b => b.Cantidad) ?? 0;
            var ultimoTurno = turnosCerrados.Last();
            if (_embarque.EsLiquido) // Liquidos
            {
                totalCargado = turnosCerrados.SelectMany(t => t.ModuloDeCargaPlanillaDeTurnosDetallesLiquido).Sum(d => d.Cantidad);
                totalTurno = ultimoTurno.ModuloDeCargaPlanillaDeTurnosDetallesLiquido.Sum(d => d.Cantidad);
            }
            else // Sólidos
            {
                totalCargado = turnosCerrados.SelectMany(t => t.ModuloDeCargaPlanillaDeTurnosDetallesSolido).Sum(d => (d.Cantidad / 1000m));
                totalTurno = ultimoTurno.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Sum(d => (d.Cantidad / 1000m));
            }
            var restaCargar = totalPlano - totalCargado;

            string viento;
            if (_periodoDeCarga == null)
            {
                var periodoCarga = _moduloDeCarga.ModuloDeCargaPeriodoDeCarga.LastOrDefault();
                viento = $"{periodoCarga.VientoAmarro} KM/H {periodoCarga.DireccionAmarro.ToUpper()}";
            }
            else
            {
                viento = $"{_periodoDeCarga.VientoDesamarro} KM/H {_periodoDeCarga.DireccionDesamarro.ToUpper()}";
            }

            plantillaEmail = plantillaEmail.Replace("{Buque}", buque);
            plantillaEmail = plantillaEmail.Replace("{TotalTurno}", totalTurno.ToString("0.000") + " TN");
            plantillaEmail = plantillaEmail.Replace("{TotalCargado}", totalCargado.ToString("0.000") + " TN");
            plantillaEmail = plantillaEmail.Replace("{TotalPlano}", totalPlano.ToString("0.000") + " TN");
            plantillaEmail = plantillaEmail.Replace("{RestaCargar}", restaCargar.ToString("0.000") + " TN");
            plantillaEmail = plantillaEmail.Replace("{Viento}", viento);

            return plantillaEmail;
        }

        private string GenerarCuerpoTurnos(IEnumerable<ModuloDeCargaPlanillaDeTurnosDto> turnosCerrados)
        {
            var turnos = _periodoDeCarga == null ? new List<ModuloDeCargaPlanillaDeTurnosDto> { turnosCerrados.Last() } : turnosCerrados;
            var turnosStr = new StringBuilder();

            foreach (var turno in turnos)
            {
                var nombreTurno = turno.TurnoPuerto.Nombre.Replace("-", " a ");
                turnosStr.AppendLine("<tr>");
                turnosStr.AppendLine($"<td style=\"border: 1px solid black; padding: 8px; text-align: left;\">{turno.Fecha?.ToString("dd/MM/yy")}</td>");
                turnosStr.AppendLine($"<td style=\"border: 1px solid black; padding: 8px; text-align: left;\">{nombreTurno}</td>");

                var comentarios = "";

                var cortes = turno.ModuloDeCargaPlanillaDeTurnosCortes.Where(c => c.MotivosDeCorte.Nombre != "Normal" && string.IsNullOrEmpty(c.Observaciones));
                if (_idsOcultos != null && _idsOcultos.Any())
                {
                    cortes = cortes.Where(x => !_idsOcultos.Contains(x.Id)).ToList();
                }

                foreach (var corte in cortes)
                {
                    if (!string.IsNullOrEmpty(comentarios))
                    {
                        comentarios += " / ";
                    }
                    comentarios += $"{corte.HoraInicio} a {corte.HoraFin} {corte.MotivosDeCorte.Siglas} {corte.Observaciones}";
                }

                if (_verObservaciones)
                {
                    foreach (var observacion in turno.ModuloDeCargaPlanillaDeTurnosObservacionesDeCalidad)
                    {
                        if (!string.IsNullOrEmpty(comentarios))
                        {
                            comentarios += " / ";
                        }
                        comentarios += $"{observacion.FechaHora?.ToString("HH:mm")} {observacion.Observaciones}";
                    }
                }

                if (string.IsNullOrEmpty(comentarios))
                {
                    comentarios = "Sin Comentarios";
                }
                turnosStr.AppendLine($"<td style=\"border: 1px solid black; padding: 8px; text-align: left;\">{comentarios}</td>");
                turnosStr.AppendLine("</tr>");
            }

            return turnosStr.ToString();
        }

        private string GenerarCuerpoEmail()
        {
            string plantillaEmail = string.Empty;

            // La plantilla es la misma para solidos y liquidos
            using (StreamReader reader = new StreamReader(Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~"), "Plantilla", "Email", "template_planilla_liquidos.html")))
            {
                plantillaEmail = reader.ReadToEnd();
            }

            var periodoCarga = GenerarCuerpoPeriodos();
            plantillaEmail = plantillaEmail.Replace("{PeriodoCarga}", periodoCarga);

            var turnosCerrados = _moduloDeCarga.ModuloDeCargaPlanillaDeTurnos.Where(t => t.GuardadoPorRecibidor && t.GuardadoPorTablerista);
            plantillaEmail = AgregarCuerpoTotales(plantillaEmail, turnosCerrados);

            var turnos = GenerarCuerpoTurnos(turnosCerrados);
            plantillaEmail = plantillaEmail.Replace("{Turnos}", turnos);

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