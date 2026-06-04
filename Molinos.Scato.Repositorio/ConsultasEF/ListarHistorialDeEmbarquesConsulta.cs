using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Globalization;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarHistorialDeEmbarquesConsulta : IConsultaPaginada<HistorialDeBuquesDto>
    {
        private readonly int VaporId;
        private readonly string NombreBuque;
        private readonly string Destino;
        private readonly string Exportador;
        private readonly string ControlPrivado;
        private readonly DateTime? FechaInicio;
        private readonly DateTime? FechaFin;
        private readonly List<string> Productos;
        private readonly List<string> Muelles;
        private readonly Paginacion paginacion;
        private static readonly string[] MuellesConocidos = { "San Benito", "Vicentin", "Nouryon", "Zárate", "Bahía Blanca", "Necochea" };

        private class PlanillaDto
        {
            public int ModuloDeCargaId { get; set; }
            public ProductoExportadorDto Dto { get; set; }
        }

        private class OtroMuelleDetalleDto
        {
            public int OtroMuelleCargaId { get; set; }
            public DateTime FechaHoraInicio { get; set; }
            public DateTime FechaHoraFin { get; set; }
            public int Exportador_Id { get; set; }
            public string NombreExportador { get; set; }
            public int MaterialPuerto_Id { get; set; }
            public string NombreMaterial { get; set; }
            public decimal Toneladas { get; set; }
            public string Destino { get; set; }
        }

        public ListarHistorialDeEmbarquesConsulta(int vaporId, string nombreBuque, string destino, string exportador, string controlPrivado, DateTime? fechaInicio, DateTime? fechaFin, List<string> productos, List<string> muelles, Paginacion paginacion)
        {
            this.VaporId = vaporId;
            this.NombreBuque = nombreBuque;
            this.Destino = destino;
            this.Exportador = exportador;
            this.ControlPrivado = controlPrivado;
            this.FechaInicio = fechaInicio;
            this.FechaFin = fechaFin;
            this.Productos = productos;
            this.Muelles = muelles?.Select(m => m.Trim()).ToList();
            this.paginacion = paginacion;
        }

        ListaPaginada<HistorialDeBuquesDto> IConsultaPaginada<HistorialDeBuquesDto>.Ejecutar(DbContext contexto)
        {
            try
            {
                ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;

                var queryPlana = (from item in contexto.Set<LineUp>()
                                  join moduloPeriodoCarga in contexto.Set<ModuloDeCargaPeriodoDeCarga>() on item.ModuloDeCarga.Id equals moduloPeriodoCarga.ModuloDeCarga.Id into moduloJoined
                                  from moduloPeriodoCarga in moduloJoined.DefaultIfEmpty()
                                  join moduloDeCargaPlanillaDeTurno in contexto.Set<ModuloDeCargaPlanillaDeTurnos>() on moduloPeriodoCarga.Id equals moduloDeCargaPlanillaDeTurno.ModuloDeCarga.Id into moduloDeCargaPlanillaDeTurnoJoined
                                  from moduloDeCargaPlanillaDeTurno in moduloDeCargaPlanillaDeTurnoJoined.DefaultIfEmpty()

                                  where item.PlanoDeCarga != null && item.Embarque != null && item.ModuloDeCarga != null &&
                                  (
                                      (this.VaporId != 0 && item.Embarque.Vapor.Id == this.VaporId) ||
                                      (this.VaporId == 0 &&
                                          item.Embarque.Ubicacion == 1 &&
                                          (String.IsNullOrEmpty(this.NombreBuque) || item.Embarque.Vapor.Nombre.ToUpper().Contains(this.NombreBuque.ToUpper())) &&
                                          (
                                              ((!item.Embarque.OtrosMuelles || item.Embarque.Muelle == null) &&
                                                  moduloPeriodoCarga != null && moduloPeriodoCarga.FechaDesamarro.HasValue &&
                                                  (this.FechaInicio == null || moduloPeriodoCarga.FechaDesamarro.Value >= this.FechaInicio.Value) &&
                                                  (this.FechaFin == null || moduloPeriodoCarga.FechaDesamarro.Value <= this.FechaFin.Value)) ||
                                              (item.Embarque.OtrosMuelles && item.Embarque.Muelle != null &&
                                                  item.Embarque.OtroMuelleCarga != null &&
                                                  (this.FechaInicio == null || item.Embarque.OtroMuelleCarga.OtroMuelleCargaDetalles.Any(d => d.FechaHoraFin >= this.FechaInicio.Value)) &&
                                                  (this.FechaFin == null || item.Embarque.OtroMuelleCarga.OtroMuelleCargaDetalles.Any(d => d.FechaHoraFin <= this.FechaFin.Value)))
                                          )
                                      )
                                  )

                                  select new
                                  {
                                      LineUpId = item.Id,
                                      NombreBuque = item.Embarque.Vapor.Nombre,
                                      EmbarqueId = item.Embarque.Id,
                                      VaporId = item.Embarque.Vapor.Id,
                                      Destino = item.Embarque.Destino != null ? item.Embarque.Destino.Nombre : "",
                                      ModuloDeCargaId = item.ModuloDeCarga != null ? item.ModuloDeCarga.Id : 0,
                                      FechaDesamarro = moduloPeriodoCarga != null ? moduloPeriodoCarga.FechaDesamarro : (DateTime?)null,
                                      FechaAmarro = moduloPeriodoCarga != null ? moduloPeriodoCarga.FechaAmarro : (DateTime?)null,
                                      HoraAmarro = moduloPeriodoCarga != null ? moduloPeriodoCarga.HoraAmarro : "",
                                      HoraDesamarro = moduloPeriodoCarga != null ? moduloPeriodoCarga.HoraDesamarro : "",
                                      EsLiquido = item.Embarque.EsLiquido,
                                      Productos = item.Embarque.MaterialPuertoCantidad.Select(x => x.MaterialPuerto.DescripcionCorta),
                                      EsSanBenito = item.Embarque.SanBenito,
                                      AgentesControlPrivadoIds = item.PlanoDeCarga.AgentesControlPrivado.Select(x => x.Id),
                                      EsNuevoMuelle = item.Embarque.OtrosMuelles && item.Embarque.Muelle != null,
                                      OtroMuelleCargaId = item.Embarque.OtroMuelleCarga != null ? (int?)item.Embarque.OtroMuelleCarga.Id : null,
                                      NombreMuelle = item.Embarque.SanBenito ? "San Benito" :
                                                     item.Embarque.Vicentin ? "Vicentin" :
                                                     item.Embarque.Noryon ? "Nouryon" :
                                                     item.Embarque.OtrosMuelles ? item.Embarque.OtroMuelleNombre : "",
                                      NroOpSap = item.Embarque.NroOpSap
                                  }).ToList();

                var otroMuelleCargaIds = new HashSet<int>(queryPlana
                    .Where(x => x.EsNuevoMuelle && x.OtroMuelleCargaId.HasValue)
                    .Select(x => x.OtroMuelleCargaId.Value));

                var otrosMuellesDetalles = otroMuelleCargaIds.Any()
                    ? contexto.Set<OtroMuelleCargaDetalle>()
                        .Where(d => otroMuelleCargaIds.Contains(d.OtroMuelleCarga.Id))
                        .Select(d => new
                        {
                            OtroMuelleCargaId = d.OtroMuelleCarga.Id,
                            FechaHoraInicio = d.FechaHoraInicio,
                            FechaHoraFin = d.FechaHoraFin,
                            Exportador_Id = d.Exportador != null ? d.Exportador.Id : 0,
                            NombreExportador = d.Exportador != null ? d.Exportador.Nombre : "",
                            MaterialPuerto_Id = d.MaterialPuerto != null ? d.MaterialPuerto.Id : 0,
                            NombreMaterial = d.MaterialPuerto != null ? d.MaterialPuerto.DescripcionCorta : "",
                            Toneladas = d.CantidadTn,
                            Destino = d.Destino != null ? d.Destino.Nombre : "",
                        })
                        .ToList()
                        .GroupBy(x => x.OtroMuelleCargaId)
                        .ToDictionary(g => g.Key, g => g.Select(x => new OtroMuelleDetalleDto
                        {
                            OtroMuelleCargaId = x.OtroMuelleCargaId,
                            FechaHoraInicio = x.FechaHoraInicio,
                            FechaHoraFin = x.FechaHoraFin,
                            Exportador_Id = x.Exportador_Id,
                            NombreExportador = x.NombreExportador,
                            MaterialPuerto_Id = x.MaterialPuerto_Id,
                            NombreMaterial = x.NombreMaterial,
                            Toneladas = x.Toneladas,
                            Destino = x.Destino,
                        }).ToList())
                    : new Dictionary<int, List<OtroMuelleDetalleDto>>();

                var queryPlanaFiltradaYOrdenada = queryPlana
                    .Where(x => !x.EsNuevoMuelle ||
                        (x.OtroMuelleCargaId.HasValue &&
                         otrosMuellesDetalles.ContainsKey(x.OtroMuelleCargaId.Value) &&
                         otrosMuellesDetalles[x.OtroMuelleCargaId.Value].Any()))
                    .OrderByDescending(x => x.EsNuevoMuelle && x.OtroMuelleCargaId.HasValue && otrosMuellesDetalles.ContainsKey(x.OtroMuelleCargaId.Value)
                        ? otrosMuellesDetalles[x.OtroMuelleCargaId.Value].Max(d => d.FechaHoraFin)
                        : x.FechaDesamarro ?? DateTime.MinValue)
                    .ToList();

                var moduloDeCargaIds = new HashSet<int>(queryPlanaFiltradaYOrdenada
                    .Where(x => !x.EsNuevoMuelle)
                    .Select(x => x.ModuloDeCargaId));

                var agentesIds = new HashSet<int>(queryPlanaFiltradaYOrdenada
                    .Where(x => x.EsSanBenito)
                    .SelectMany(x => x.AgentesControlPrivadoIds));

                var agentes = agentesIds.Any()
                    ? contexto.Set<AgenteControlPrivado>()
                        .Where(a => agentesIds.Contains(a.Id))
                        .Select(a => new AgenteControlPrivadoDto
                        {
                            Id = a.Id,
                            Nombre = a.Nombre,
                            Apellido = a.Apellido
                        }).ToList()
                    : new List<AgenteControlPrivadoDto>();

                var planillasLiquido = moduloDeCargaIds.Any()
                    ? contexto.Set<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>()
                        .Where(p => moduloDeCargaIds.Contains(p.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id))
                        .Select(p => new
                        {
                            ModuloDeCargaId = p.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id,
                            Exportador_Id = p.Exportador != null ? p.Exportador.Id : 0,
                            MaterialPuerto_Id = p.MaterialPuerto != null ? p.MaterialPuerto.Id : 0,
                            NombreExportador = p.Exportador != null ? p.Exportador.Nombre : "",
                            NombreMaterial = p.MaterialPuerto != null ? p.MaterialPuerto.DescripcionCorta : "",
                            Toneladas = p.Cantidad,
                            Destino = p.Destino != null ? p.Destino.Nombre : "",
                        })
                        .ToList()
                        .Select(p => new PlanillaDto
                        {
                            ModuloDeCargaId = p.ModuloDeCargaId,
                            Dto = new ProductoExportadorDto
                            {
                                Exportador_Id = p.Exportador_Id,
                                MaterialPuerto_Id = p.MaterialPuerto_Id,
                                NombreExportador = p.NombreExportador,
                                NombreMaterial = p.NombreMaterial,
                                Toneladas = p.Toneladas,
                                Destino = p.Destino,
                            }
                        }).ToList()
                    : new List<PlanillaDto>();

                var planillasSolido = moduloDeCargaIds.Any()
                    ? contexto.Set<ModuloDeCargaPlanillaDeTurnosDetallesSolido>()
                        .Where(p => moduloDeCargaIds.Contains(p.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id))
                        .Select(p => new
                        {
                            ModuloDeCargaId = p.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id,
                            Exportador_Id = p.Exportador != null ? p.Exportador.Id : 0,
                            MaterialPuerto_Id = p.MaterialPuerto != null ? p.MaterialPuerto.Id : 0,
                            NombreExportador = p.Exportador != null ? p.Exportador.Nombre : "",
                            NombreMaterial = p.MaterialPuerto != null ? p.MaterialPuerto.DescripcionCorta : "",
                            Toneladas = (decimal)p.Cantidad / 1000,
                            Destino = p.Destino != null ? p.Destino.Nombre : "",
                        })
                        .ToList()
                        .Select(p => new PlanillaDto
                        {
                            ModuloDeCargaId = p.ModuloDeCargaId,
                            Dto = new ProductoExportadorDto
                            {
                                Exportador_Id = p.Exportador_Id,
                                MaterialPuerto_Id = p.MaterialPuerto_Id,
                                NombreExportador = p.NombreExportador,
                                NombreMaterial = p.NombreMaterial,
                                Toneladas = p.Toneladas,
                                Destino = p.Destino,
                            }
                        }).ToList()
                    : new List<PlanillaDto>();

				#region TransaccionesSAP
				var embarqueIdsLong = queryPlanaFiltradaYOrdenada.Select(x => (long)x.EmbarqueId).Distinct().ToList();
				var transaccionesSapDict = new Dictionary<long, List<TransaccionesSAP>>();

				if (embarqueIdsLong.Any())
				{
					var transaccionesList = contexto.Set<TransaccionesSAP>()
						.Include("DetallesEmbarque")
						.Where(t => t.Entidad == "Embarque" && embarqueIdsLong.Contains(t.Entidad_Id))
						.ToList();

					transaccionesSapDict = transaccionesList
						.GroupBy(t => t.Entidad_Id)
						.ToDictionary(
							g => g.Key,
							g => g.OrderByDescending(t => t.Id).ToList()
						);
				}
				#endregion

				bool CompararSinTildes(string a, string b) => string.Compare(a, b,
					CultureInfo.InvariantCulture, CompareOptions.IgnoreNonSpace | CompareOptions.IgnoreCase) == 0;

				var incluirOtrosMuelles = this.Muelles != null && this.Muelles.Any(m => CompararSinTildes(m, "Otros Muelles"));

				var filteredQuery = queryPlanaFiltradaYOrdenada
					.Select(x =>
					{
						var detalles = x.EsNuevoMuelle && x.OtroMuelleCargaId.HasValue && otrosMuellesDetalles.ContainsKey(x.OtroMuelleCargaId.Value)
							? otrosMuellesDetalles[x.OtroMuelleCargaId.Value]
							: new List<OtroMuelleDetalleDto>();

						var transaccionesDelEmbarque = transaccionesSapDict.ContainsKey((long)x.EmbarqueId)
							? transaccionesSapDict[(long)x.EmbarqueId]
							: new List<TransaccionesSAP>();

						var ultimoIntento = transaccionesDelEmbarque.FirstOrDefault();
						var ultimoExitoso = transaccionesDelEmbarque.FirstOrDefault(t => t.Estado == "Enviado");

						var productoExportadorActual = x.EsNuevoMuelle
							? detalles.Select(d => new ProductoExportadorDto { Exportador_Id = d.Exportador_Id, MaterialPuerto_Id = d.MaterialPuerto_Id, Destino = d.Destino, Toneladas = d.Toneladas })
							: planillasLiquido.Where(p => p.ModuloDeCargaId == x.ModuloDeCargaId).Select(p => p.Dto)
								.Concat(planillasSolido.Where(p => p.ModuloDeCargaId == x.ModuloDeCargaId).Select(p => p.Dto));

						bool tieneCambiosPendientes = true;

						if (ultimoExitoso != null && ultimoIntento != null && ultimoIntento.Estado == "Enviado")
						{
							decimal kilosActuales = Math.Round(productoExportadorActual.Sum(p => p.Toneladas) * 1000m, 0);
							int cantItemsActuales = productoExportadorActual.GroupBy(p => new { p.Exportador_Id, p.MaterialPuerto_Id, p.Destino }).Count();

							decimal kilosEnviados = 0;
							int cantItemsEnviados = 0;

							if (ultimoExitoso.DetallesEmbarque != null)
							{
								var itemsActivosSap = ultimoExitoso.DetallesEmbarque.Where(d => d.OperacionItem != "B").ToList();
								kilosEnviados = Math.Round(itemsActivosSap.Sum(d => d.Cantidad), 0);
								cantItemsEnviados = itemsActivosSap.Count();
							}

							if (kilosActuales == kilosEnviados && cantItemsActuales == cantItemsEnviados)
							{
								tieneCambiosPendientes = false;
							}
						}

						return new HistorialDeBuquesDto
						{
							LineUpId = x.LineUpId,
							NombreBuque = x.NombreBuque,
							EmbarqueId = x.EmbarqueId,
							VaporId = x.VaporId,
							Destino = x.Destino,
							ModuloDeCargaId = x.ModuloDeCargaId,
							FechaAmarro = x.EsNuevoMuelle
								? (DateTime?)detalles.OrderBy(d => d.FechaHoraInicio).First().FechaHoraInicio
								: x.FechaAmarro,
							FechaDesamarro = x.EsNuevoMuelle
								? (DateTime?)detalles.OrderBy(d => d.FechaHoraFin).Last().FechaHoraFin
								: x.FechaDesamarro,
							HoraAmarro = x.EsNuevoMuelle
								? detalles.OrderBy(d => d.FechaHoraInicio).First().FechaHoraInicio.ToString("HH:mm")
								: x.HoraAmarro,
							HoraDesamarro = x.EsNuevoMuelle
								? detalles.OrderBy(d => d.FechaHoraFin).Last().FechaHoraFin.ToString("HH:mm")
								: x.HoraDesamarro,
							EsLiquido = x.EsLiquido,
							Productos = x.Productos,
							NombreMuelle = x.NombreMuelle,
							NroOpSap = x.NroOpSap,
							AgentesControlPrivado = x.EsSanBenito
								? agentes.Where(a => x.AgentesControlPrivadoIds.Contains(a.Id))
								: Enumerable.Empty<AgenteControlPrivadoDto>(),
							ProductoExportador = x.EsNuevoMuelle
								? detalles.Select(d => new ProductoExportadorDto
								{
									Exportador_Id = d.Exportador_Id,
									MaterialPuerto_Id = d.MaterialPuerto_Id,
									NombreExportador = d.NombreExportador,
									NombreMaterial = d.NombreMaterial,
									Toneladas = d.Toneladas,
									Destino = d.Destino,
								})
								: planillasLiquido
									.Where(p => p.ModuloDeCargaId == x.ModuloDeCargaId).Select(p => p.Dto)
									.Concat(planillasSolido
										.Where(p => p.ModuloDeCargaId == x.ModuloDeCargaId).Select(p => p.Dto)),
							ItemsPorPagina = paginacion.ItemsPorPagina,
							Pagina = paginacion.Pagina,
							ItemsTotales = 0,
							// TransaccionesSAP
							EnSap = ultimoExitoso != null ? "SI" : "NO",
							MensajeErrorSap = ultimoIntento != null && ultimoIntento.Estado == "Error" ? ultimoIntento.ResponseSAP : null,
							TieneCambiosPendientes = tieneCambiosPendientes
						};
					})
					.Where(x =>
                        (String.IsNullOrEmpty(this.Exportador) || x.ProductoExportador.Any(y => y.NombreExportador.ToUpper().Contains(this.Exportador.ToUpper()))) &&
                        (String.IsNullOrEmpty(this.Destino) || x.ProductoExportador.Any(y => y.Destino.ToUpper().Contains(this.Destino.ToUpper()))) &&
                        (this.Productos == null || x.ProductoExportador.Any(y => this.Productos.Contains(y.NombreMaterial))) &&
                        (String.IsNullOrEmpty(this.ControlPrivado) || x.AgentesControlPrivado.Any(y => y.name.ToUpper().Contains(this.ControlPrivado.ToUpper()))) &&
                        (this.Muelles == null || !this.Muelles.Any() || this.Muelles.Any(m => CompararSinTildes(m, x.NombreMuelle)) ||
                            (incluirOtrosMuelles && !MuellesConocidos.Any(conocido => CompararSinTildes(conocido, x.NombreMuelle))))
                    )
                    .GroupBy(x => x.EmbarqueId)
                    .Select(x => x.FirstOrDefault())
                    .ToList();

                var itemsTotales = filteredQuery.Count();
                var resultados = filteredQuery
                    .Skip(paginacion.Pagina * paginacion.ItemsPorPagina)
                    .Take(paginacion.ItemsPorPagina)
                    .ToList();

                if (resultados != null && resultados.Any())
                {
                    resultados.First().ItemsTotales = itemsTotales;
                }

                return new ListaPaginada<HistorialDeBuquesDto>(resultados, paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}