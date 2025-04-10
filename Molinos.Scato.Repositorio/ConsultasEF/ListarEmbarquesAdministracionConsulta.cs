using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarEmbarquesAdministracionConsulta : IConsultaPaginada<AdministracionEmbarqueDto>
    {
        private readonly List<string> buques;
        private readonly List<string> muelles;
        private readonly string tanques;
        private readonly List<string> exportadores;
        private readonly List<string> clientes;
        private readonly List<string> materiales;
        private readonly List<string> estados;

        private readonly DateTime? desamarre;
        private readonly Paginacion paginacion;

        public ListarEmbarquesAdministracionConsulta(Paginacion paginacion, DateTime? desamarre = null, List<string> buques = null,
            List<string> muelles = null, string tanques = null, List<string> exportadores = null,
            List<string> clientes = null, List<string> materiales = null, List<string> estados = null)
        {
            this.desamarre = desamarre;
            this.buques = buques;
            this.muelles = muelles;
            this.tanques = tanques;
            this.exportadores = exportadores;
            this.clientes = clientes;
            this.materiales = materiales;
            this.estados = estados;
            this.paginacion = paginacion;
        }

        public ListaPaginada<AdministracionEmbarqueDto> Ejecutar(DbContext contexto)
        {
            DateTime? primerDiaMes = desamarre.HasValue ? new DateTime(desamarre.Value.Year, desamarre.Value.Month, 1) : (DateTime?)null;
            DateTime? ultimoDiaMes = desamarre.HasValue ? primerDiaMes.Value.AddMonths(1).AddDays(-1) : (DateTime?)null;

            var embarques = from embarque in contexto.Set<Embarque>()
                         join lineup in contexto.Set<LineUp>()
                         on embarque.Id equals lineup.Embarque.Id
                         join nominacion in contexto.Set<Nominacion>()
                         on embarque.Id equals nominacion.Embarque.Id
                         where !desamarre.HasValue ||
                         (lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.Any() &&
                         lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.FirstOrDefault().FechaDesamarro >= primerDiaMes &&
                         lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.FirstOrDefault().FechaDesamarro <= ultimoDiaMes) ||
                         (lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.All(p => p.FechaDesamarro == null) &&
                         nominacion.NominacionDatoTecnico.ETARecalada >= primerDiaMes &&
                         nominacion.NominacionDatoTecnico.ETARecalada <= ultimoDiaMes)
                         select new
                         {
                             Embarque = embarque,
                             LineUp = lineup,
                             Nominacion = nominacion
                         };

            var embarquesClonadosLineup = from embarque in contexto.Set<Embarque>()
                         join lineup in contexto.Set<LineUp>()
                         on embarque.Id equals lineup.Embarque.Id
                         join nEmb in contexto.Set<NominacionEmbarque>()
                         on embarque.Id equals nEmb.Embarque.Id
                         where !desamarre.HasValue ||
                         (lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.Any() &&
                         lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.FirstOrDefault().FechaDesamarro >= primerDiaMes &&
                         lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.FirstOrDefault().FechaDesamarro <= ultimoDiaMes) ||
                         (lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.All(p => p.FechaDesamarro == null) &&
                         nEmb.Nominacion.NominacionDatoTecnico.ETARecalada >= primerDiaMes &&
                         nEmb.Nominacion.NominacionDatoTecnico.ETARecalada <= ultimoDiaMes)
                         select new
                         {
                             Embarque = embarque,
                             LineUp = lineup,
                             Nominacion = nEmb.Nominacion
                         };

            var allEmbarques = embarques.Union(embarquesClonadosLineup).ToList();

            var queryList = allEmbarques.AsEnumerable().GroupBy(x => x.Embarque).Select(g => new AdministracionEmbarqueDto
            {
                Buque = g.Key.Patente,
                Estado = g.Key.Ubicacion == 1 ? "A FACTURAR" :
              !g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos).Any() ? "EN LINEUP" :
              g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos).All(x => x.Cerrado) ? "EN CALIDAD" : "EN OPERACIONES",
                EsLiquido = g.Key.EsLiquido,

                ItemsEmbarque = g.SelectMany(n =>
                {
                    var tnMoa = g.Key.EsLiquido ? g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos?.SelectMany(y => y.ModuloDeCargaPlanillaDeTurnosDetallesLiquido) ?? Enumerable.Empty<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>())
                        .Where(x => x.MaterialPuerto.Id == n.Nominacion.NominacionDatoTecnico.MaterialPuerto.Id &&
                        g.SelectMany(y => y.LineUp?.ModuloDeCarga?.ModuloDeCargaLineasDeEmbarque ?? Enumerable.Empty<ModuloDeCargaLineasDeEmbarque>())
                    .Any(l => l.Id == x.Linea_Id && (l.TipoLineaEmbarque.Linea == "Nueva" || l.TipoLineaEmbarque.Linea == "Vieja")))
                    .Distinct().Sum(c => c.Cantidad) : 0;

                    var tnVic = g.Key.EsLiquido ? g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos?.SelectMany(y => y.ModuloDeCargaPlanillaDeTurnosDetallesLiquido) ?? Enumerable.Empty<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>())
                        .Where(x => x.MaterialPuerto.Id == n.Nominacion.NominacionDatoTecnico.MaterialPuerto.Id &&
                                    g.SelectMany(y => y.LineUp?.ModuloDeCarga?.ModuloDeCargaLineasDeEmbarque ?? Enumerable.Empty<ModuloDeCargaLineasDeEmbarque>())
                                     .Any(l => l.Id == x.Linea_Id && l.TipoLineaEmbarque.Linea == "Vicentin"))
                        .Distinct().Sum(c => c.Cantidad) : 0;

                    var exportadoresVic = g.Key.EsLiquido ? string.Join(",", g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos?.SelectMany(y => y.ModuloDeCargaPlanillaDeTurnosDetallesLiquido) ?? Enumerable.Empty<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>())
                        .Where(x => x.MaterialPuerto.Id == n.Nominacion.NominacionDatoTecnico.MaterialPuerto.Id &&
                        g.SelectMany(y => y.LineUp?.ModuloDeCarga?.ModuloDeCargaLineasDeEmbarque ?? Enumerable.Empty<ModuloDeCargaLineasDeEmbarque>())
                        .Any(l => l.Id == x.Linea_Id && l.TipoLineaEmbarque.Linea == "Vicentin"))
                        .Select(c => c.Exportador.Nombre).Distinct()) : null;

                    var exportadoresMoa = g.Key.EsLiquido ? string.Join(",", g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos?.SelectMany(y => y.ModuloDeCargaPlanillaDeTurnosDetallesLiquido) ?? Enumerable.Empty<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>())
                        .Where(x => x.MaterialPuerto.Id == n.Nominacion.NominacionDatoTecnico.MaterialPuerto.Id &&
                                    g.SelectMany(y => y.LineUp?.ModuloDeCarga?.ModuloDeCargaLineasDeEmbarque ?? Enumerable.Empty<ModuloDeCargaLineasDeEmbarque>())
                                     .Any(l => l.Id == x.Linea_Id && (l.TipoLineaEmbarque.Linea == "Vieja" || l.TipoLineaEmbarque.Linea == "Nueva")))
                        .Select(c => c.Exportador.Nombre).Distinct()) : null;

                    var items = new List<ProductoEmbarqueDto>();

                    if (tnVic > 0)
                    {
                        items.Add(new ProductoEmbarqueDto
                        {
                            Producto = n.Nominacion?.NominacionDatoTecnico?.MaterialPuerto?.Descripcion,
                            Tn = tnVic,
                            Amarre = g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>()).Any() &&
                                g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>()).First().FechaAmarro != null ?
                                g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>()).First().FechaAmarro :
                                n.Nominacion?.NominacionDatoTecnico?.ETARecalada,
                            Desamarre = g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>()).Any() &&
                                g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>()).First().FechaDesamarro != null ?
                                g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>()).First().FechaDesamarro :
                                (DateTime?)null,
                            Muelle = g.Key.SanBenito ? "San Benito" : g.Key.Vicentin ? "Vicentin" : g.Key.Noryon ? "Nouryon" : g.Key.OtrosMuelles ?
                            g.Key.OtroMuelleNombre : n.Nominacion?.NominacionDatoTecnico?.MuelleDeCarga?.Descripcion ?? "",
                            Exportador = tnVic > 0 ? exportadoresVic : string.Join(",", n.Nominacion?.NominacionDatoTecnico?.NominacionDatoTecnicoExportador?.Select(x => x.Exportador?.Nombre) ?? new List<string>()),
                            Cliente = string.Join(",", n.Nominacion?.NominacionDatoTecnico?.NominacionDatoTecnicoCoordinadorPuerto?.Select(c => c.CoordinadorPuerto?.Nombre) ?? new List<string>()),
                            Fumigacion = n.Nominacion?.NominacionDetalleIntervencion?.Fumigacion ?? (n.LineUp?.PlanoDeCarga?.Fumigacion == true ? "Si" : "No"),
                            Senasa = g.Key.Senasa ? "Si" : "No",
                            DefMoviles = n.LineUp?.PlanoDeCarga != null ? (n.LineUp.PlanoDeCarga.DefensasMoviles ? "Si" : "No") : "-",
                            Tanque = "VICENTIN"
                        });
                    }

                    if (tnMoa > 0)
                    {
                        items.Add(new ProductoEmbarqueDto
                        {
                            Producto = n.Nominacion?.NominacionDatoTecnico?.MaterialPuerto?.Descripcion,
                            Tn = tnMoa,
                            Amarre = g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>()).Any() &&
                            g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>()).First().FechaAmarro != null ?
                            g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>()).First().FechaAmarro :
                            n.Nominacion?.NominacionDatoTecnico?.ETARecalada,
                            Desamarre = g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>()).Any() &&
                                g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>()).First().FechaDesamarro != null ?
                                g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>()).First().FechaDesamarro :
                                (DateTime?)null,
                            Muelle = g.Key.SanBenito ? "San Benito" : g.Key.Vicentin ? "Vicentin" : g.Key.Noryon ? "Nouryon" : g.Key.OtrosMuelles ?
                            g.Key.OtroMuelleNombre : n.Nominacion?.NominacionDatoTecnico?.MuelleDeCarga?.Descripcion ?? "",
                            Exportador = tnMoa > 0 ? exportadoresMoa : string.Join(",", n.Nominacion?.NominacionDatoTecnico?.NominacionDatoTecnicoExportador?.Select(x => x.Exportador?.Nombre) ?? new List<string>()),
                            Cliente = string.Join(",", n.Nominacion?.NominacionDatoTecnico?.NominacionDatoTecnicoCoordinadorPuerto?.Select(c => c.CoordinadorPuerto?.Nombre) ?? new List<string>()),
                            Fumigacion = n.Nominacion?.NominacionDetalleIntervencion?.Fumigacion ?? (n.LineUp?.PlanoDeCarga?.Fumigacion == true ? "Si" : "No"),
                            Senasa = g.Key.Senasa ? "Si" : "No",
                            DefMoviles = n.LineUp?.PlanoDeCarga != null ? (n.LineUp.PlanoDeCarga.DefensasMoviles ? "Si" : "No") : "-",
                            Tanque = "MOA"
                        });
                    }

                    if (tnVic == 0 && tnMoa == 0) //significa que aun no se cargo lineas, o es embarque solido
                    {
                        items.Add(new ProductoEmbarqueDto
                        {
                            Producto = n.Nominacion.NominacionDatoTecnico.MaterialPuerto.Descripcion,
                            Tn = g.Key.EsLiquido ? n.Nominacion.NominacionDatoTecnico.CantidadTotal :
                            n.Nominacion.NominacionDatoTecnico.MuelleDeCarga.Descripcion != "San Benito" || !g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos).Any() ?
                            n.Nominacion.NominacionDatoTecnico.CantidadTotal :
                            g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(y => y.ModuloDeCargaPlanillaDeTurnosDetallesSolido))
                            .Where(x => x.MaterialPuerto.Id == n.Nominacion.NominacionDatoTecnico.MaterialPuerto.Id).Sum(y => (decimal)y.Cantidad / 1000),

                            Amarre = g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga).Any() && g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga).First().FechaAmarro != null ?
                            g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga).First().FechaAmarro : n.Nominacion.NominacionDatoTecnico.ETARecalada,
                            Desamarre = g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga).Any() && g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga).First().FechaDesamarro != null ?
                            g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga).First().FechaDesamarro : (DateTime?)null,
                            Muelle = g.Key.SanBenito ? "San Benito" : g.Key.Vicentin ? "Vicentin" : g.Key.Noryon ? "Nouryon" : g.Key.OtrosMuelles ?
                            g.Key.OtroMuelleNombre : n.Nominacion?.NominacionDatoTecnico?.MuelleDeCarga?.Descripcion ?? "",
                            Exportador = string.Join(",", n.Nominacion?.NominacionDatoTecnico?.NominacionDatoTecnicoExportador?.Select(x => x.Exportador?.Nombre) ?? new List<string>()),
                            Cliente = string.Join(",", n.Nominacion?.NominacionDatoTecnico?.NominacionDatoTecnicoCoordinadorPuerto?.Select(c => c.CoordinadorPuerto?.Nombre) ?? new List<string>()),
                            Fumigacion = n.Nominacion?.NominacionDetalleIntervencion?.Fumigacion ?? (n.LineUp?.PlanoDeCarga?.Fumigacion == true ? "Si" : "No"),
                            Senasa = g.Key.Senasa ? "Si" : "No",
                            DefMoviles = n.LineUp.PlanoDeCarga != null ? (n.LineUp.PlanoDeCarga.DefensasMoviles ? "Si" : "No") : "-",
                        });
                    }

                    return items;
                }).ToList()
            }).OrderBy(x => x.ItemsEmbarque.First().Amarre).ThenBy(x => x.ItemsEmbarque.First().Desamarre).ToList();

            if (buques != null && buques.Any())
            {
                queryList = queryList.Where(x => buques.Contains(x.Buque)).ToList();
            }

            if (estados != null && estados.Any())
            {
                queryList = queryList.Where(x => estados.Contains(x.Estado)).ToList();
            }

            if (muelles != null && muelles.Any())
            {
                queryList = queryList.Where(x => x.ItemsEmbarque.Any(item => muelles.Contains(item.Muelle))).ToList();
            }

            if (exportadores != null && exportadores.Any())
            {
                queryList = queryList.Where(x => x.ItemsEmbarque.Any(item => exportadores.Any(exp => item.Exportador.Contains(exp)))).ToList();
            }

            if (clientes != null && clientes.Any())
            {
                queryList = queryList.Where(x => x.ItemsEmbarque.Any(item => clientes.Any(cli => item.Cliente.Contains(cli)))).ToList();
            }

            if (materiales != null && materiales.Any())
            {
                queryList = queryList.Where(x => x.ItemsEmbarque.Any(item => materiales.Contains(item.Producto))).ToList();
            }

            if (tanques != null)
            {
                queryList = queryList.Where(x => x.ItemsEmbarque.Any(item => item.Tanque == tanques)).ToList();
            }

            var itemsTotales = queryList.Count();
            var saltear = (paginacion.Pagina - 1) * paginacion.ItemsPorPagina;

            var queryFinal = queryList.Skip(saltear);
            if (paginacion.ItemsPorPagina > 0)
            {
                queryFinal = queryFinal.Take(paginacion.ItemsPorPagina);
            }

            var resultado = queryFinal.ToList();
            return new ListaPaginada<AdministracionEmbarqueDto>(resultado, paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}