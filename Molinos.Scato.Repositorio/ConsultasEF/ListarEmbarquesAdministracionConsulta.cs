using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarEmbarquesAdministracionConsulta : IConsultaPaginada<InformacionEmbarqueDto>
    {
        private readonly List<string> buques;
        private readonly List<string> muelles;
        private readonly string tanques;
        private readonly List<string> exportadores;
        private readonly List<string> materiales;
        private readonly List<string> estados;

        private readonly DateTime? desamarre;
        private readonly Paginacion paginacion;

        public ListarEmbarquesAdministracionConsulta(Paginacion paginacion, DateTime? desamarre = null, List<string> buques = null,
            List<string> muelles = null, string tanques = null, List<string> exportadores = null,
            List<string> materiales = null, List<string> estados = null)
        {
            this.desamarre = desamarre;
            this.buques = buques;
            this.muelles = muelles;
            this.tanques = tanques;
            this.exportadores = exportadores;
            this.materiales = materiales;
            this.estados = estados;
            this.paginacion = paginacion;
        }

        public ListaPaginada<InformacionEmbarqueDto> Ejecutar(DbContext contexto)
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
                            nominacion.NominacionDatoTecnico.ETARecalada <= ultimoDiaMes &&                        
                            nominacion.FechaEliminacion == null)
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
                                          nEmb.Nominacion.NominacionDatoTecnico.ETARecalada <= ultimoDiaMes &&
                                          nEmb.Nominacion.FechaEliminacion == null)
                                          select new
                                          {
                                              Embarque = embarque,
                                              LineUp = lineup,
                                              Nominacion = nEmb.Nominacion
                                          };

            var allEmbarques = embarques.Union(embarquesClonadosLineup).ToList();

            /*allEmbarques.RemoveAll(e =>
                e?.Embarque?.Ubicacion == 1 &&
                e.Embarque.SanBenito == true &&
                (e?.LineUp?.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos == null ||
                 !e.LineUp.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos.Any())
            );*/

            allEmbarques.RemoveAll(e =>
            {
                var sinTurnos = e?.LineUp?.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos == null
                                || !e.LineUp.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos.Any();

                var sinOtrosMuelles = e?.LineUp?.Embarque?.OtroMuelleCarga?.OtroMuelleCargaDetalles == null
                                      || !e.LineUp.Embarque.OtroMuelleCarga.OtroMuelleCargaDetalles.Any();

                var sinCargaReal = sinTurnos && sinOtrosMuelles;

                return sinCargaReal && e?.Embarque?.Ubicacion == 1;
            });

            var lineasTipos = contexto.Set<TipoLineaEmbarque>().ToList();

            var queryList = allEmbarques.AsEnumerable().GroupBy(x => x.Embarque).Select(g => new InformacionEmbarqueDto
            {
                IdEmbarque = g.Key.Id,
                Buque = g.Key.Patente,
                Estado = g.Key.AdministracionEmbarque != null ? g.Key.AdministracionEmbarque?.Estado?.Descripcion.ToUpper() : g.Key.Ubicacion == 1 ? "A FACTURAR" :
                g.Key.OtrosMuelles ? g.Select(x => x.LineUp.Embarque.OtroMuelleCarga).FirstOrDefault() == null ? "LINEUP" : "OPERACIONES"
                :!g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos).Any() ? "LINEUP" :
                g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos).All(x => x.Cerrado) ? "CALIDAD" : "OPERACIONES",               

                EsLiquido = g.Key.EsLiquido,
                NroOperacion = g.Key.NroOpSap != null ? g.Key.NroOpSap.ToString() : "",

                ItemsEmbarque = g.SelectMany(n =>
                {
                    var items = new List<ProductoEmbarqueDto>();
                    var exportadores = new List<ItemExportadorDto>();
                    if (g.Key.EsLiquido)
                    {
                        var cargasLiq = n.LineUp?.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos?
                            .SelectMany(t => t?.ModuloDeCargaPlanillaDeTurnosDetallesLiquido ?? Enumerable.Empty<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>())
                            ?? Enumerable.Empty<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>();

                        var lineas = n.LineUp?.ModuloDeCarga?.ModuloDeCargaLineasDeEmbarque;

                        var obtenerTanque = new Func<ModuloDeCargaPlanillaDeTurnosDetallesLiquido, string>(carga =>
                        {
                            var linea = lineas?.FirstOrDefault(l => l.Id == carga.Linea_Id)?.Linea ?? lineasTipos.FirstOrDefault(lt => lt.Id == carga.Linea_Id)?.Linea;
                            if (linea == "Nueva" || linea == "Vieja" || linea == "Biodiesel") return "MOA";
                            return linea ?? "";
                        });

                        if (cargasLiq != null && cargasLiq.Any())
                        {
                            exportadores = cargasLiq.Where(c => c.MaterialPuerto.Id == n.Nominacion.NominacionDatoTecnico.MaterialPuerto.Id)
                            .Select(carga => new
                            {
                                Exportador = carga.Exportador?.Nombre ?? "",
                                Tn = carga.Cantidad,
                                Tanque = obtenerTanque(carga),
                                Senasa = (n.Nominacion?.NominacionDetalleIntervencion?.Senasa?
                                        .FirstOrDefault(s => s.TieneSenasa && s.Exportador?.Id == carga.Exportador.Id) != null) ? "Si" : "No",
                                SenasaEmpresa = n.Nominacion?.NominacionDetalleIntervencion?.Senasa?
                                        .FirstOrDefault(s => s.TieneSenasa && s.Exportador?.Id == carga.Exportador.Id)?.ACuentaDe ?? ""
                            })
                            .GroupBy(x => x.Exportador)
                            .Select(itemExp =>
                            {
                                var tanques = itemExp.Select(x => x.Tanque).Distinct().ToList();
                                bool tieneMoa = tanques.Any(t => t == "MOA");
                                bool tieneOtros = tanques.Any(t => t != "MOA");

                                return new ItemExportadorDto
                                {
                                    Exportador = itemExp.Key,
                                    Tn = itemExp.Sum(x => x.Tn),
                                    Tanque = tieneMoa && tieneOtros ? "Ambas" : tieneMoa ? "MOA" : tanques.FirstOrDefault() ?? "",
                                    Senasa = itemExp.Any(x => x.Senasa == "Si") ? "Si" : "No",
                                    SenasaEmpresa = itemExp.FirstOrDefault(x => x.Senasa == "Si")?.SenasaEmpresa ?? ""
                                };
                            })
                            .ToList();
                        }
                    }
                    else
                    {
                        var cargasSol = n.LineUp?.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos?
                           .SelectMany(t => t?.ModuloDeCargaPlanillaDeTurnosDetallesSolido ?? Enumerable.Empty<ModuloDeCargaPlanillaDeTurnosDetallesSolido>())
                           ?? Enumerable.Empty<ModuloDeCargaPlanillaDeTurnosDetallesSolido>();

                        if (cargasSol != null && cargasSol.Any())
                        {
                            exportadores = cargasSol.Where(c => c.MaterialPuerto.Id == n.Nominacion.NominacionDatoTecnico.MaterialPuerto.Id)
                                    .GroupBy(c => c.Exportador?.Nombre)
                                    .Select(item => new ItemExportadorDto
                                    {
                                        Exportador = item.Key,
                                        Tn = item.Sum(y => (decimal)y.Cantidad / 1000),
                                        Tanque = "",
                                        Senasa = (n.Nominacion?.NominacionDetalleIntervencion?.Senasa?
                                                    .FirstOrDefault(s => s.TieneSenasa && s.Exportador?.Nombre == item.Key) != null) ? "Si" : "No",
                                        SenasaEmpresa = n.Nominacion?.NominacionDetalleIntervencion?.Senasa?
                                            .FirstOrDefault(s => s.TieneSenasa && s.Exportador?.Nombre == item.Key)?.ACuentaDe ?? ""
                                    }).ToList();
                        }
                    }
                
                    //OTROS MUELLES
                    DateTime? amarreOtroMuelle = null;
                    DateTime? desamarreOtroMuelle = null;

                    if (g.Key.OtrosMuelles)
                    {
                        var otroMuelleCarga = n.LineUp?.Embarque?.OtroMuelleCarga;                        

                        if (otroMuelleCarga != null && otroMuelleCarga.OtroMuelleCargaDetalles.Any())
                        {
                            amarreOtroMuelle = otroMuelleCarga.OtroMuelleCargaDetalles.Min(x => x.FechaHoraInicio);
                            desamarreOtroMuelle = g.Key.Ubicacion == 1
                                                 ? (DateTime?)otroMuelleCarga.OtroMuelleCargaDetalles.Max(x => x.FechaHoraFin)
                                                 : null;

                            exportadores = otroMuelleCarga.OtroMuelleCargaDetalles
                                .Where(d => d.MaterialPuerto.Id == n.Nominacion.NominacionDatoTecnico.MaterialPuerto.Id)
                                .GroupBy(d => d.Exportador.Nombre)
                                .Select(item => new ItemExportadorDto
                                {
                                    Exportador = item.Key,
                                    Tn = item.Sum(d => d.CantidadTn),
                                    Tanque = "-",
                                    Senasa = otroMuelleCarga.Senasa ? "Si" : "No",
                                    SenasaEmpresa = ""
                                }).ToList();
                        }
                        else
                        {
                            exportadores = (n.Nominacion?.NominacionDatoTecnico?.NominacionDatoTecnicoExportador
                                ?? new List<NominacionDatoTecnicoExportador>())
                                .Select(exp => new ItemExportadorDto
                                {
                                    Exportador = exp.Exportador?.Nombre ?? "",
                                    Tn = exp.Cantidad,
                                    Tanque = "-",
                                    Senasa = (n.Nominacion?.NominacionDetalleIntervencion?.Senasa?
                                                .FirstOrDefault(s => s.TieneSenasa && s.Exportador?.Id == exp.Exportador.Id) != null) ? "Si" : "No",
                                    SenasaEmpresa = n.Nominacion?.NominacionDetalleIntervencion?.Senasa?
                                        .FirstOrDefault(s => s.TieneSenasa && s.Exportador?.Id == exp.Exportador.Id)?.ACuentaDe ?? "",
                                }).ToList();
                        }
                    }          

                    items.Add(new ProductoEmbarqueDto
                        {
                        Producto = n.Nominacion?.NominacionDatoTecnico?.MaterialPuerto?.Descripcion ?? "",                        

                        Amarre = g.Key.OtrosMuelles && amarreOtroMuelle != null
                        ? amarreOtroMuelle
                        : g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga).Any() &&
                        g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga).First().FechaAmarro != null
                        ? g.SelectMany(x => x.LineUp.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga).First().FechaAmarro
                        : n.Nominacion.NominacionDatoTecnico.ETARecalada,
                      
                        Desamarre = g.Key.OtrosMuelles && desamarreOtroMuelle != null
                        ? desamarreOtroMuelle
                        : g.SelectMany(x => x.LineUp?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga ?? Enumerable.Empty<ModuloDeCargaPeriodoDeCarga>())
                        .FirstOrDefault()?.FechaDesamarro,

                                Muelle = g.Key.SanBenito ? "San Benito" :
                                     g.Key.Vicentin ? "Vicentin" :
                                     g.Key.Noryon ? "Nouryon" :
                                     g.Key.OtrosMuelles ? g.Key.OtroMuelleNombre :
                                 n.Nominacion?.NominacionDatoTecnico?.Muelle != null ?
                                     (n.Nominacion.NominacionDatoTecnico.Muelle.Descripcion == "Otros Muelles" ?
                                         n.Nominacion.NominacionDatoTecnico.OtroMuelleNombre :
                                         n.Nominacion.NominacionDatoTecnico.Muelle.Descripcion) :
                                 n.Nominacion?.NominacionDatoTecnico?.MuelleDeCarga?.Descripcion == "Otros Muelles" ?
                                     n.Nominacion.NominacionDatoTecnico.OtroMuelleNombre :
                                         n.Nominacion?.NominacionDatoTecnico?.MuelleDeCarga?.Descripcion ?? "",
                            Cliente = string.Join(",",
                                    n.Nominacion?.NominacionDatoTecnico?.NominacionDatoTecnicoCoordinadorPuerto?
                                        .Select(c => c.CoordinadorPuerto?.Nombre ?? "")
                                    ?? new List<string>()),
                        
                        Fumigacion = g.Key.OtrosMuelles && n.LineUp?.Embarque?.OtroMuelleCarga != null
                                    ? (n.LineUp.Embarque.OtroMuelleCarga.FumigacionPreventiva ||
                                    n.LineUp.Embarque.OtroMuelleCarga.FumigacionCurativa ? "Si" : "No")
                                    : (n.LineUp?.PlanoDeCarga?.Fumigacion == true ? "Si" :
                                    n.Nominacion?.NominacionDetalleIntervencion?.Fumigacion ?? "No"),
                        FumigacionEmpresa = n.Nominacion?.NominacionDetalleIntervencion?.Fumigacion == "Si"
                                    ? n.Nominacion?.NominacionDetalleIntervencion?.CompaniaACuentaDe ?? ""
                                    : "",
                            DefMoviles = n.LineUp?.PlanoDeCarga != null
                                    ? (n.LineUp.PlanoDeCarga.DefensasMoviles ? "Si" : "No")
                                    : "-",
                            ItemsExportadores = exportadores != null && exportadores.Any() ? exportadores
                                    : (n.Nominacion?.NominacionDatoTecnico?.NominacionDatoTecnicoExportador ?? new List<NominacionDatoTecnicoExportador>())
                                        .Select(exp => new ItemExportadorDto
                                        {
                                            Exportador = exp.Exportador?.Nombre ?? "",
                                            Tn = exp.Cantidad,
                                            Tanque = "-",
                                            Senasa = (n.Nominacion?.NominacionDetalleIntervencion?.Senasa?
                                                        .FirstOrDefault(s => s.TieneSenasa && s.Exportador?.Id == exp.Exportador.Id) != null) ? "Si" : "No",
                                            SenasaEmpresa = n.Nominacion?.NominacionDetalleIntervencion?.Senasa?
                                                .FirstOrDefault(s => s.TieneSenasa && s.Exportador?.Id == exp.Exportador.Id)?.ACuentaDe ?? "",
                                        }).ToList()
                        });

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
                bool compararSinTildes(string a, string b) => string.Compare(a, b, CultureInfo.InvariantCulture, CompareOptions.IgnoreNonSpace | CompareOptions.IgnoreCase) == 0;

                var muellesConocidos = new[] { "San Benito", "Vicentin", "Nouryon", "Zárate", "Bahía Blanca", "Necochea" };
                var incluirOtrosMuelles = muelles.Any(m => compararSinTildes(m, "Otros Muelles"));

                queryList = queryList.Where(x => x.ItemsEmbarque.Any(item => 
                    muelles.Any(m => compararSinTildes(m, item.Muelle)) ||
                    (incluirOtrosMuelles && !muellesConocidos.Any(conocido => compararSinTildes(conocido, item.Muelle)))
                )).ToList();
            }

            if (exportadores != null && exportadores.Any())

            {
                queryList = queryList.Where(x => x.ItemsEmbarque.Any(item => exportadores.Any(exp => item.ItemsExportadores.Select(it => it.Exportador).Contains(exp)))).ToList();
            }

            if (materiales != null && materiales.Any())
            {
                queryList = queryList.Where(x => x.ItemsEmbarque.Any(item => materiales.Contains(item.Producto))).ToList();
            }

            if (tanques != null)
            {
                queryList = queryList.Where(x => x.ItemsEmbarque.Any(item => item.ItemsExportadores.Select(it => it.Tanque).Contains(tanques))).ToList();
            }

            queryList = queryList.Where(x =>
                x.ItemsEmbarque != null &&
                x.ItemsEmbarque.Any(i =>
                i.ItemsExportadores != null &&
                i.ItemsExportadores.Any()
                )).ToList();

            var itemsTotales = queryList.Count();
            var saltear = (paginacion.Pagina - 1) * paginacion.ItemsPorPagina;

            var queryFinal = queryList.Skip(saltear);
            if (paginacion.ItemsPorPagina > 0)
            {
                queryFinal = queryFinal.Take(paginacion.ItemsPorPagina);
            }

            var resultado = queryFinal.ToList();
            return new ListaPaginada<InformacionEmbarqueDto>(resultado, paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}