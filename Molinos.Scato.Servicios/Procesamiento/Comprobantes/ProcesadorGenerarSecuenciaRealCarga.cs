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

                // Se agrupan cargas por balanza, ordenadas por fecha de inicio
                var cargasPorBalanza = Repositorio.Incluir<BalanzasCortes>()
                    .Where(bc => bc.ModuloDeCarga_id == comando.ModuloDeCargaId && bc.Bodega_id.HasValue)
                    .OrderBy(bc => bc.NumeroBalanza)
                    .ThenBy(bc => bc.Fecha_Inicio)
                    .GroupBy(c => c.NumeroBalanza).ToList();


                foreach (var gBalanza in cargasPorBalanza)
                {
                    var numeroBalanza = gBalanza.Key;

                    // Se agrupan las cargas de la balanza por Fecha y turno
                    var gruposFechaTurno = gBalanza
                        .GroupBy(c => new { Fecha = c.Fecha_Inicio.Value.Date, Turno = ObtenerTurnoPorHora(c.Fecha_Inicio.Value.Hour) })
                        .OrderBy(g => g.Key.Fecha).ThenBy(g => g.Key.Turno);

                    // Diccionario para guardar las cargas que se pasan de horario hacia el día siguiente
                    var proximoInicioDict = new Dictionary<DateTime, DateTime>();

                    foreach (var gFechaTurno in gruposFechaTurno)
                    {
                        DateTime fecha = gFechaTurno.Key.Fecha;
                        int turno = gFechaTurno.Key.Turno;

                        // Obtengo si quedó pendiente el inicio por una carga que se pasó del día anterior
                        DateTime? inicioOficial = null;
                        if (proximoInicioDict.TryGetValue(fecha, out var val))
                        {
                            inicioOficial = val;
                        }

                        // Se agrupan las cargas de la balanza, fecha y turno por bodega
                        var gruposPorBodega = gFechaTurno.GroupBy(c => c.Bodega_id.Value).OrderBy(x => x.Key);

                        foreach (var gBodega in gruposPorBodega)
                        {
                            int numeroBodega = gBodega.Key; // Aunque se llame Bodega_id, en la tabla BalanzasCortes se guarda el numero de balanza y no el id

                            DateTime inicioReal = gBodega.First().Fecha_Inicio.Value;
                            DateTime finReal = gBodega.Last().Fecha_Corte.Value;

                            DateTime inicioTurno = inicioOficial ?? inicioReal;
                            inicioOficial = null; // lo limpio ya que solo me sirve para la primer carga del turno

                            DateTime finTurnoOficial = fecha.AddHours(turno * 6);
                            DateTime finTurno;

                            var claveDia = turno == 4 ? fecha.AddDays(1) : fecha;
                            if (finReal > finTurnoOficial)
                            {
                                finTurno = finTurnoOficial;
                                proximoInicioDict[claveDia] = finTurnoOficial;
                            }
                            else
                            {
                                finTurno = finReal;
                                proximoInicioDict.Remove(claveDia);
                            }

                            var detallesTurno = moduloDeCarga.ModuloDeCargaPlanillaDeTurnos
                                .Where(pt => pt.Fecha.Value.Date == fecha && pt.TurnoPuerto.Orden == turno)
                                .SelectMany(pt => pt.ModuloDeCargaPlanillaDeTurnosDetallesSolido)
                                // Para convertir un Char en int se hace la operacion "Char - '0'", de otra manera podría devolver el indice ASCII del Char
                                .Where(ds => (ds.Bodega.Nombre.Last() - '0') == numeroBodega && ds.BalanzaPuerto.CodigoBalanza == numeroBalanza);

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
                                Balanza = int.Parse(numeroBalanza)
                            };

                            secuenciaRealCarga.ComprobanteDeEmbarqueDetalles.Add(detalle);
                        }
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

        private int ObtenerTurnoPorHora(int hora)
        {
            return (hora / 6) + 1;
        }
    }
}
