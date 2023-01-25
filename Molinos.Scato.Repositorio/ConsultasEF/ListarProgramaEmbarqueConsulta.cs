using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Transactions;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Consultas;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarProgramaEmbarqueConsulta : IConsultaPaginada<ProgramaEmbarqueDto>
    {
        private readonly List<string> Muelles;
        private readonly List<string> Buques;
        private readonly DateTime? FechaInicio;
        private readonly List<string> Productos;
        private readonly Paginacion paginacion;

        public ListarProgramaEmbarqueConsulta(Paginacion paginacion, DateTime? fechaInicio, List<string> buques = null, List<string> muelles = null, List<string> productos = null)
        {

            this.FechaInicio = fechaInicio;
            this.Productos = productos;
            this.paginacion = paginacion;
            this.Muelles = muelles;
            this.Buques = buques;
        }

        public ListaPaginada<ProgramaEmbarqueDto> Ejecutar(DbContext contexto)
        {
            var hoy = DateTime.Now;
            var ayer = hoy.AddDays(-1);
            try
            {

                ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;
                var resultado = from item in contexto.Set<Nominacion>()
                                where (FechaInicio == null || (item.NominacionDatoTecnico.ETARecalada.Value.Year == FechaInicio.Value.Year &&
                                item.NominacionDatoTecnico.ETARecalada.Value.Month == FechaInicio.Value.Month))
                                && (item.Embarque == null || item.Embarque.Ubicacion != 1)
                                && (item.FechaEliminacion == null || (ayer < item.FechaEliminacion.Value && item.FechaEliminacion.Value < hoy))

                                orderby item.FechaCreacion descending

                                select new ProgramaEmbarqueDto
                                {
                                    Id = item.Id,
                                    ProductoColor = item.NominacionDatoTecnico.MaterialPuerto.Color,
                                    Producto = item.NominacionDatoTecnico.MaterialPuerto.DescripcionCortaIngles,
                                    FechaEliminacion = item.FechaEliminacion.HasValue ? item.FechaEliminacion : null,
                                    FechaCreacion = item.FechaCreacion.HasValue ? item.FechaCreacion : null,
                                    FechaEnvioLineUp = item.FechaEnvioLineUp.HasValue ? item.FechaEnvioLineUp : null,
                                    NombreBuque = item.NominacionDatoTecnico.VaporInformacion.NombreBuque,
                                    MuelleDeCarga = item.NominacionDatoTecnico.MuelleDeCarga.Descripcion,
                                    Cargadores = from nominacionDatoTecnico in contexto.Set<NominacionDatoTecnicoExportador>()
                                                 where nominacionDatoTecnico.NominacionDatoTecnico.Id == item.NominacionDatoTecnico.Id
                                                 select new NominacionCargadorDto()
                                                 {
                                                     NombreExportador = nominacionDatoTecnico.Exportador.Nombre,
                                                     Toneladas = nominacionDatoTecnico.Cantidad
                                                 },
                                    ETARecalada = item.NominacionDatoTecnico.ETARecalada != null ? item.NominacionDatoTecnico.ETARecalada : null,
                                    EnviadoFumigador = item.EnviadoFumigador,
                                    EnviadoOtros = item.EnviadoOtros,
                                    EnviadoSurveyor = item.EnviadoSurveyor,
                                    Contrato = item.NominacionDatoTecnico.TipoDeContrato.Descripcion,
                                    Estado = item.FechaEnvioLineUp.HasValue && !item.FechaEliminacion.HasValue ? 1 :
                                    (item.FechaCreacion < hoy && item.FechaCreacion > ayer) && !item.FechaEliminacion.HasValue ? 2
                                    : item.FechaCreacion < ayer && !item.FechaEliminacion.HasValue ? 3 : item.FechaEliminacion.HasValue ? 4 : 0,
                                    ItemPorPagina = paginacion.ItemsPorPagina,
                                    Pagina = paginacion.Pagina,
                                    ItemsTotales = 0,
                                    CompaniaFumigador = item.NominacionDetalleIntervencion != null && item.NominacionDetalleIntervencion.CompaniaDeFumigacion != null ?
                                    item.NominacionDetalleIntervencion.CompaniaDeFumigacion.Descripcion : "",
                                    Surveyor = item.NominacionDatoTecnico.Surveyor != null ? item.NominacionDatoTecnico.Surveyor.Descripcion : ""
                                };

                var resultados = resultado.ToList().Where(x => (
                (!string.IsNullOrEmpty(x.Producto) && (Productos == null || Productos.Any(y => y.Contains(x.Producto))))) &&
                (!string.IsNullOrEmpty(x.NombreBuque) && (Buques == null || Buques.Any(y => y.Contains(x.NombreBuque)))) &&
                (!string.IsNullOrEmpty(x.MuelleDeCarga) && (Muelles == null || Muelles.Any(y => y.Contains(x.MuelleDeCarga)))));

                var itemsTotales = resultados.Count();
                resultados = resultados.Skip((paginacion.Pagina) * paginacion.ItemsPorPagina)
                    .Take(paginacion.ItemsPorPagina);
                if (resultados != null && resultados.Count() > 0)
                {
                    resultados.FirstOrDefault().ItemsTotales = itemsTotales;
                }

                return new ListaPaginada<ProgramaEmbarqueDto>(resultados.ToList(), paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);

            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}
