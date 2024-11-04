using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarProgramaEmbarqueConsulta : IConsultaPaginada<ProgramaEmbarqueDto>
    {
        private readonly List<string> Muelles;
        private readonly List<string> Buques;
        private readonly DateTime? FechaInicio;
        private readonly List<string> Productos;
        private readonly bool? Zarpo;
        private readonly Paginacion paginacion;

        public ListarProgramaEmbarqueConsulta(Paginacion paginacion, DateTime? fechaInicio, List<string> buques = null, List<string> muelles = null, List<string> productos = null, bool? zarpo = null)
        {
            this.FechaInicio = fechaInicio;
            this.Productos = productos ?? new List<string>();
            this.paginacion = paginacion;
            this.Muelles = muelles ?? new List<string>();
            this.Buques = buques ?? new List<string>();
            this.Zarpo = zarpo;
        }

        public ListaPaginada<ProgramaEmbarqueDto> Ejecutar(DbContext contexto)
        {
            var hoy = DateTime.Now;
            var ayer = hoy.AddDays(-1);
            try
            {
                ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;
                var resultado = contexto.Set<Nominacion>()
                                .Where(n => (FechaInicio == null || n.NominacionDatoTecnico.ETARecalada.Value.Year == FechaInicio.Value.Year &&
                                n.NominacionDatoTecnico.ETARecalada.Value.Month == FechaInicio.Value.Month)
                                && (n.FechaEliminacion == null || (ayer < n.FechaEliminacion.Value && n.FechaEliminacion.Value < hoy))
                                && n.NominacionDatoTecnico.TipoDeContrato.Descripcion != "FAS"
                                &&
                                (
                                   this.Zarpo == true ?
                                    ((n.Embarque != null && n.Embarque.Ubicacion == 1 && !n.Embarques.Any()) ||
                                     (n.Embarque != null && n.Embarque.Ubicacion == 1 && n.Embarques.Any() && n.Embarques.All(e => e.Embarque.Ubicacion == 1))) :
                                   this.Zarpo == false ?
                                    ((n.Embarque == null && !n.Embarques.Any()) ||
                                    (n.Embarque != null && n.Embarque.Ubicacion != 1) ||
                                    (n.Embarques.Any(e => e.Embarque.Ubicacion != 1))) : 
                                    true
                                )

                                ).Select(pe => new ProgramaEmbarqueDto
                                {
                                    Id = pe.Id,
                                    ProductoColor = pe.NominacionDatoTecnico.MaterialPuerto.Color,
                                    Producto = pe.NominacionDatoTecnico.MaterialPuerto.DescripcionCortaIngles ?? pe.NominacionDatoTecnico.MaterialPuerto.DescripcionCorta,
                                    FechaEliminacion = pe.FechaEliminacion.HasValue ? pe.FechaEliminacion : null,
                                    FechaCreacion = pe.FechaCreacion.HasValue ? pe.FechaCreacion : null,
                                    FechaEnvioLineUp = pe.FechaEnvioLineUp.HasValue ? pe.FechaEnvioLineUp : null,
                                    NombreBuque = pe.NominacionDatoTecnico.VaporInformacion.NombreBuque,
                                    MuelleDeCarga = pe.NominacionDatoTecnico.MuelleDeCarga.Descripcion,
                                    Cargadores = contexto.Set<NominacionDatoTecnicoExportador>().Where(ndte =>
                                    ndte.NominacionDatoTecnico.Id == pe.NominacionDatoTecnico.Id).Select(nc => new NominacionCargadorDto
                                    {
                                        NombreExportador = nc.Exportador.Nombre,
                                        Toneladas = nc.Cantidad
                                    }),
                                    ETARecalada = pe.NominacionDatoTecnico.ETARecalada != null ? pe.NominacionDatoTecnico.ETARecalada : null,
                                    EnviadoFumigador = pe.EnviadoFumigador,
                                    EnviadoOtros = pe.EnviadoOtros,
                                    EnviadoSurveyor = pe.EnviadoSurveyor,
                                    Contrato = pe.NominacionDatoTecnico.TipoDeContrato.Descripcion,
                                    Estado =  pe.FechaEnvioLineUp.HasValue && !pe.FechaEliminacion.HasValue ? 1 :
                                    (pe.FechaCreacion < hoy && pe.FechaCreacion > ayer) && !pe.FechaEliminacion.HasValue ? 2
                                    : pe.FechaCreacion < ayer && !pe.FechaEliminacion.HasValue ? 3 : pe.FechaEliminacion.HasValue ? 4 : 0,
                                    ItemPorPagina = paginacion.ItemsPorPagina,
                                    Pagina = paginacion.Pagina,
                                    ItemsTotales = 0,
                                    CompaniaFumigador = pe.NominacionDetalleIntervencion != null && pe.NominacionDetalleIntervencion.CompaniaDeFumigacion != null ?
                                    pe.NominacionDetalleIntervencion.CompaniaDeFumigacion.Descripcion : "",
                                    Surveyor = pe.NominacionDatoTecnico.Surveyor != null ? pe.NominacionDatoTecnico.Surveyor.Descripcion : "",
                                    Zarpo = pe.Embarque != null && pe.Embarque.Ubicacion == 1 && !pe.Embarques.Any() ||
                                    (pe.Embarque != null && pe.Embarque.Ubicacion == 1 && 
                                    pe.Embarques.Any() && pe.Embarques.All(e => e.Embarque.Ubicacion == 1)),
                                    TieneConfiguracionDocumento = pe.ConfiguracionDocumentos.Count > 0 ? true : false
                                }).OrderBy(r => r.FechaCreacion);

                
                var resultados = resultado.Where(x => (
                !string.IsNullOrEmpty(x.Producto) && (!Productos.Any() || Productos.Any(y => y.Contains(x.Producto)))) &&
                (!string.IsNullOrEmpty(x.NombreBuque) && (!Buques.Any() || Buques.Any(y => y.Contains(x.NombreBuque)))) &&
                (!string.IsNullOrEmpty(x.MuelleDeCarga) && (!Muelles.Any() || Muelles.Any(y => y.Contains(x.MuelleDeCarga)))));

                var itemsTotales = resultados.Count();
                resultados = resultados.Skip((paginacion.Pagina) * paginacion.ItemsPorPagina)
                    .Take(paginacion.ItemsPorPagina);
                var lista = resultados.ToList();
                if (resultados != null && resultados.Count() > 0)
                {
                    lista.FirstOrDefault().ItemsTotales = itemsTotales;
                }

                return new ListaPaginada<ProgramaEmbarqueDto>(lista, paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
            }
            catch (Exception ex)
            {
                throw;
            }
        }


    }
}