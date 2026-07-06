using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Linq.Expressions;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarPaginadoCargas : IConsultaPaginada<CargaDto>
    {
        private readonly CargaFiltroDto filtro;
        private readonly Paginacion paginacion;

        public ListarPaginadoCargas(CargaFiltroDto filtro, Paginacion paginacion)
        {
            this.filtro = filtro;
            this.paginacion = paginacion;
        }

        public ListaPaginada<CargaDto> Ejecutar(DbContext contexto)
        {
            ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;
            Expression<Func<Carga, bool>> expresionFiltro = null;

            if (filtro != null)
            {
                filtro.IdMaterial = (filtro.IdMaterial.HasValue) ? ((filtro.IdMaterial == 0) ? null : filtro.IdMaterial) : null;
                filtro.IdVapor = (filtro.IdVapor.HasValue) ? ((filtro.IdVapor == 0) ? null : filtro.IdVapor) : null;
                filtro.IdExportador = (filtro.IdExportador.HasValue) ? ((filtro.IdExportador == 0) ? null : filtro.IdExportador) : null;
                filtro.IdDestino = (filtro.IdDestino.HasValue) ? ((filtro.IdDestino == 0) ? null : filtro.IdDestino) : null;
                filtro.IdBodega = (filtro.IdBodega.HasValue) ? ((filtro.IdBodega == 0) ? null : filtro.IdBodega) : null;
                filtro.NumeroBalanza = (filtro.NumeroBalanza == "TODAS") ? null : filtro.NumeroBalanza;
                var fechaHasta = filtro.FechaHasta.HasValue ? filtro.FechaHasta.Value.Date.AddDays(1) : (DateTime?)null;
                expresionFiltro = x => (!filtro.Id.HasValue || filtro.Id == x.Id) &&
                                       (string.IsNullOrEmpty(filtro.NumeroBalanza) || filtro.NumeroBalanza == x.NumeroBalanza) &&
                                       (!filtro.IdVapor.HasValue || (x.Vapor != null && filtro.IdVapor == x.Vapor.Id)) &&
                                       (string.IsNullOrEmpty(filtro.VaporDesc) || (x.Vapor != null && x.Vapor.Nombre.Contains(filtro.VaporDesc))) &&
                                       (!filtro.IdMaterial.HasValue || (x.Material != null && filtro.IdMaterial == x.Material.Id)) &&
                                       (string.IsNullOrEmpty(filtro.MaterialDesc) || (x.Material != null && x.Material.Descripcion.Contains(filtro.MaterialDesc))) &&
                                       (!filtro.IdBodega.HasValue || (x.Bodega != null && filtro.IdBodega == x.Bodega.Id)) &&
                                       (string.IsNullOrEmpty(filtro.BodegaDesc) || (x.Bodega != null && x.Bodega.Nombre.Contains(filtro.BodegaDesc))) &&
                                       (!filtro.IdExportador.HasValue || (x.Exportador != null && filtro.IdExportador == x.Exportador.Id)) &&
                                       (string.IsNullOrEmpty(filtro.ExportadorDesc) || (x.Exportador != null && x.Exportador.Nombre.Contains(filtro.ExportadorDesc))) &&
                                       (!filtro.IdDestino.HasValue || (x.Destino != null && filtro.IdDestino == x.Destino.Id)) &&
                                       (string.IsNullOrEmpty(filtro.DestinoDesc) || (x.Destino != null && x.Destino.Nombre.Contains(filtro.DestinoDesc))) &&
                                       (!filtro.FechaDesde.HasValue || filtro.FechaDesde <= x.Fecha) &&
                                       (!fechaHasta.HasValue || fechaHasta > x.Fecha) &&
                                       (x.Tipo == "inicio" || (x.Tipo == "fin" && x.CargaOpuesta == null));
            }


            var resultado = contexto.Set<Carga>().Where(expresionFiltro).Select(x => new CargaDto
            {
                Bodega = x.Bodega == null ? "" : x.Bodega.Nombre,
                BodegaId = x.Bodega == null ? 0 : x.Bodega.Id,
                CargaOpuesta_Id = x.CargaOpuesta_Id,
                CargaOpuesta_NumeroBalanza = x.CargaOpuesta_NumeroBalanza,
                Destino = x.Destino == null ? "" : x.Destino.Nombre,
                DestinoId = x.Destino == null ? 0 : x.Destino.Id,
                EnviadoASap = x.EnviadoASap,
                Exportador = x.Exportador == null ? "" : x.Exportador.Nombre,
                ExportadorId = x.Exportador == null ? 0 : x.Exportador.Id,
                Fecha = x.Fecha,
                FechaInicio = x.FechaInicio,
                Id = x.Id,
                IdFin = x.CargaOpuesta_Id,
                Material = x.Material == null ? "" : x.Material.Descripcion,
                MaterialId = x.Material == null ? 0 : x.Material.Id,
                NumeroBalanza = x.NumeroBalanza,
                PesoProgramado = x.PesoProgramado,
                Tipo = x.Tipo,
                ToneladasAW = x.ToneladasAW,
                Vapor = x.Vapor == null ? "" : x.Vapor.Nombre,
                VaporId = x.Vapor == null ? 0 : x.Vapor.Id,
                Pediente = x.CargaOpuesta_Id == null
            }).OrderByDescending(x => x.Pediente);




            if (paginacion.OrdenarPor != null)
            {
                var selectorOrden = Expresiones.Propiedad<CargaDto>(paginacion.OrdenarPor);
                resultado = paginacion.DireccionOrden == DirOrden.Asc
                                 ? resultado.ThenBy(selectorOrden)
                                 : resultado.ThenByDescending(selectorOrden);
            }
            
            var itemsTotales = resultado.Count();

            IQueryable<CargaDto> resultadoPagina;
            if (paginacion.ItemsPorPagina > 0)
            {
                resultadoPagina = resultado
                    .Skip((paginacion.Pagina - 1) * paginacion.ItemsPorPagina)
                    .Take(paginacion.ItemsPorPagina);
            }
            else
            {
                resultadoPagina = resultado;
            }

            return new ListaPaginada<CargaDto>(resultadoPagina.ToList(), paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}
