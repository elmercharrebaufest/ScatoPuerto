using System;
using System.Collections.Generic;
using System.Linq;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Dominio.Entidades;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento.Comprobantes
{
    public class ProcesadorGenerarSecuenciaRealCarga : ProcesadorComando<GenerarSecuenciaRealCarga>
    {
        public ProcesadorGenerarSecuenciaRealCarga(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }


        // Clase auxiliar para representar un segmento de carga dentro de un turno
        private class SegmentoCarga
        {
            public int NumeroBalanza { get; set; }
            public int NumeroBodega { get; set; }
            public DateTime Fecha { get; set; }
            public int Turno { get; set; }
            public DateTime Inicio { get; set; }
            public DateTime Fin { get; set; }
        }

        public override Resultado Ejecutar(GenerarSecuenciaRealCarga comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var tipoComprobante = Repositorio.Obtener<TipoComprobante>(tc => tc.Descripcion == "Secuencia Real") ?? throw new Exception("No existe el tipo de comprobante \"Secuencia Real\" en la base de datos");
                var moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(comando.ModuloDeCargaId) ?? throw new Exception("No se encontró el módulo de carga especificado.");

                var tieneDetallesSolidos = moduloDeCarga.ModuloDeCargaPlanillaDeTurnos.Any(t => t.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Any());
                if (!tieneDetallesSolidos)
                {
                    throw new Exception("No existen cargas para generar la secuencia real de carga.");
                }

                var lineup = Repositorio.Obtener<LineUp>(l => l.ModuloDeCarga.Id == comando.ModuloDeCargaId);
                var buque = lineup.Embarque.Vapor.Nombre;

                var cantidadSecuenciasReales = Repositorio.Contar<ComprobanteDeEmbarque>(c => c.ModuloDeCarga.Id == comando.ModuloDeCargaId && c.TipoComprobante.Id == tipoComprobante.Id);

                var secuenciaRealCarga = new ComprobanteDeEmbarque
                {
                    Buque = buque,
                    UsuarioEmision = comando.Usuario,
                    ModuloDeCarga = moduloDeCarga,
                    TipoComprobante = tipoComprobante,
                    NumeroComprobante = cantidadSecuenciasReales + 1,
                    ComprobanteDeEmbarqueDetalles = new List<ComprobanteDeEmbarqueDetalle>(),
                    Estado = 1,
                    FechaETA = lineup.Embarque.FechaRecalada?.ToString("dd/MM/yyyy") ?? "-"
                };

                var planoCargaBodegas = lineup.PlanoDeCarga.PlanoDeCargaBodega.ToList();
                var balanzas = Repositorio.Listar<BalanzaPuerto>();

                // Se obtienen todas las cargas, ordenadas por fecha de inicio
                var cargasOriginales = Repositorio.Incluir<BalanzasCortes>()
                    .Where(bc => bc.ModuloDeCarga_id == comando.ModuloDeCargaId && bc.Bodega_id.HasValue)
                    .OrderBy(bc => bc.NumeroBalanza)
                    .ThenBy(bc => bc.Fecha_Inicio)
                    .ToList();

                // Expandir cargas que abarcan múltiples turnos en segmentos
                var segmentos = new List<SegmentoCarga>();

                foreach (var carga in cargasOriginales)
                {
                    var numeroBalanza = carga.NumeroBalanza;
                    var numeroBodega = carga.Bodega_id.Value;
                    DateTime inicio = carga.Fecha_Inicio.Value;
                    DateTime fin = carga.Fecha_Corte.Value;

                    var segmentosCarga = DividirCargaEnTurnos(numeroBalanza, numeroBodega, inicio, fin);
                    segmentos.AddRange(segmentosCarga);
                }

                // Agrupar segmentos por balanza
                var segmentosPorBalanza = segmentos.GroupBy(s => s.NumeroBalanza).OrderBy(g => g.Key);

                foreach (var gBalanza in segmentosPorBalanza)
                {
                    var numeroBalanza = gBalanza.Key;

                    // Agrupar por fecha, turno y bodega
                    var gruposFechaTurnoBodega = gBalanza
                        .GroupBy(s => new { s.Fecha, s.Turno, s.NumeroBodega })
                        .OrderBy(g => g.Key.Fecha)
                        .ThenBy(g => g.Key.Turno)
                        .ThenBy(g => g.Key.NumeroBodega);

                    foreach (var grupo in gruposFechaTurnoBodega)
                    {
                        DateTime fecha = grupo.Key.Fecha;
                        int turno = grupo.Key.Turno;
                        int numeroBodega = grupo.Key.NumeroBodega;

                        DateTime inicioTurno = grupo.Min(s => s.Inicio);
                        DateTime finTurno = grupo.Max(s => s.Fin);

                        var detallesTurno = moduloDeCarga.ModuloDeCargaPlanillaDeTurnos
                            .Where(pt => pt.Fecha.Value.Date == fecha && pt.TurnoPuerto.Orden == turno)
                            .SelectMany(pt => pt.ModuloDeCargaPlanillaDeTurnosDetallesSolido)
                            // Para convertir un Char en int se hace la operacion "Char - '0'", de otra manera podría devolver el indice ASCII del Char
                            .Where(ds => (ds.Bodega.Nombre.Last() - '0') == numeroBodega && ds.BalanzaPuerto.CodigoBalanza == numeroBalanza.ToString());

                        int cantidad = detallesTurno.Sum(ds => ds.Cantidad);
                        var material = planoCargaBodegas.FirstOrDefault(p => p.BodegaParcel == numeroBodega)?.MaterialPuerto.Descripcion ?? "";

                        var detalle = new ComprobanteDeEmbarqueDetalle
                        {
                            Producto = material,
                            Bodega = "00" + numeroBodega,
                            Exportador = "",
                            Destino = "",
                            FechaCarga = fecha,
                            Turno = turno,
                            Cantidad = cantidad,
                            FechaInicioCarga = inicioTurno,
                            FechaFinCarga = finTurno,
                            Balanza = numeroBalanza
                        };

                        secuenciaRealCarga.ComprobanteDeEmbarqueDetalles.Add(detalle);
                    }
                }

                secuenciaRealCarga.FechaEmision = DateTime.Now;
                secuenciaRealCarga.ComprobanteDeEmbarqueDetalles = secuenciaRealCarga.ComprobanteDeEmbarqueDetalles
                    .OrderBy(d => d.FechaCarga.Date)
                    .ThenBy(d => d.Turno)
                    .ThenBy(d => d.FechaInicioCarga)
                    .ThenBy(d => d.Bodega)
                    .ToList();

                var logABM = new LogABM
                {
                    Pantalla = "GenerarSecuenciaRealCarga",
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = Dominio.Enums.EventoABM.Alta,
                    Entidad = $"Generación de secuencia real de carga para módulo de carga ID {moduloDeCarga.Id}"
                };

                Repositorio.Agregar(secuenciaRealCarga);
                Repositorio.Agregar(logABM);

                Repositorio.GuardarCambios();
                resultado.Id = secuenciaRealCarga.Id;
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al generar la secuencia real de carga {0}", e);
            }
            return resultado;
        }

        private List<SegmentoCarga> DividirCargaEnTurnos(string numeroBalanza, int numeroBodega, DateTime inicio, DateTime fin)
        {
            var segmentos = new List<SegmentoCarga>();
            DateTime actual = inicio;

            while (actual < fin)
            {
                var turnoActual = ObtenerTurnoPorHora(actual.Hour);
                var fechaTurno = actual.Date;

                // Calcular el fin del turno actual
                DateTime finTurno = ObtenerFinDeTurno(fechaTurno, turnoActual);

                // El segmento termina en el menor entre el fin de la carga o el fin del turno
                DateTime finSegmento = fin < finTurno ? fin : finTurno;

                segmentos.Add(new SegmentoCarga
                {
                    NumeroBalanza = int.Parse(numeroBalanza),
                    NumeroBodega = numeroBodega,
                    Fecha = fechaTurno,
                    Turno = turnoActual,
                    Inicio = actual,
                    Fin = finSegmento
                });

                // Avanzar al siguiente segmento
                actual = finSegmento;
            }

            return segmentos;
        }

        private DateTime ObtenerFinDeTurno(DateTime fecha, int turno)
        {
            // Turnos: 1 (0-6), 2 (6-12), 3 (12-18), 4 (18-24)
            int horaFin = turno * 6;

            if (horaFin == 24)
            {
                // El turno 4 termina a las 00:00 del día siguiente
                return fecha.AddDays(1).Date;
            }

            return fecha.Date.AddHours(horaFin);
        }

        private int ObtenerTurnoPorHora(int hora)
        {
            return (hora / 6) + 1;
        }
    }
}
