using System;
using System.Data.Entity;
using System.Data.Objects;
using System.Linq;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class BajaCtgDefinitivaConsulta : IConsultaPaginada<TransmisionBajaCtgDefinitivaDto>
    {
        private readonly FiltroPanelDeBajaCtgDefinitivaDto filtro;
        private readonly Paginacion paginacion;


        public BajaCtgDefinitivaConsulta(FiltroPanelDeBajaCtgDefinitivaDto filtro, Paginacion paginacion)
        {
            this.filtro = filtro;
            this.paginacion = paginacion;
        }

        public ListaPaginada<TransmisionBajaCtgDefinitivaDto> Ejecutar(DbContext contexto)
        {
            IQueryable<TransmisionBajaCtgDefinitivaDto> resultados = from tra in contexto.Set<BajaCTG>()
                                                        join rec in contexto.Set<Recorrido>() on tra.WorkflowId equals rec.InstanciaWorkflow
                                                        where filtro.CentroId == rec.Centro.Id && 

                                                        (!filtro.EstadoTransmisionASap.HasValue ||
                                                            (filtro.EstadoTransmisionASap == EstadoTransmisionASap.Correcto
                                                             && tra.CodigoDeBaja != null && tra.CodigoDeBajaDefinitivo != null)
                                                             ||
                                                            (filtro.EstadoTransmisionASap == EstadoTransmisionASap.Error
                                                             && (tra.CodigoDeBaja == null || tra.CodigoDeBajaDefinitivo == null)))

                                                        && !rec.Rechazado
                                                        && ((DateTime)EntityFunctions.AddHours(tra.Fecha, -3) >= filtro.FechaDesde && (DateTime)EntityFunctions.AddHours(tra.Fecha, -3) <= filtro.FechaHasta) && (filtro.NumeroDocumentoIngreso == "" || rec.NumeroDocumentoIngreso == filtro.NumeroDocumentoIngreso)
                                                        && (filtro.Patente == "" || rec.Patente == filtro.Patente) && (!filtro.TipoDocumentoIngreso.HasValue || filtro.TipoDocumentoIngreso == rec.TipoDocumentoIngreso)
                            select
                                new TransmisionBajaCtgDefinitivaDto
                                    {
                                        Id = tra.Id,
                                        EstadoCtg = (tra.CodigoDeBaja == null) ? EstadoTransmisionASap.Error : EstadoTransmisionASap.Correcto,
                                        EstadoCtgDefinitivo = (tra.CodigoDeBajaDefinitivo == null) ? EstadoTransmisionASap.Error : EstadoTransmisionASap.Correcto,
                                        Fecha = (DateTime) EntityFunctions.AddHours(tra.Fecha,-3),
                                        InstanciaWorkflow = tra.WorkflowId,
                                        MensajeError = (tra.CodigoDeBaja == null || tra.CodigoDeBajaDefinitivo == null) ? contexto.Set<ControlRecorrido>().Where(x => x.WorkflowInstanceId == tra.WorkflowId && (x.Actividad == "Baja CTG Definitivo")).OrderByDescending(x => x.Id).FirstOrDefault().Comentario : "",
                                        NumeroDocumento = rec.NumeroDocumentoIngreso,
                                        Patente = rec.Patente,
                                        TipoDocumentoIngreso = rec.TipoDocumentoIngreso,
                                    };

            if (paginacion.OrdenarPor != null)
            {
                var selectorOrden = Expresiones.Propiedad<TransmisionBajaCtgDefinitivaDto>(paginacion.OrdenarPor);
                resultados = paginacion.DireccionOrden == DirOrden.Asc
                                 ? resultados.OrderBy(selectorOrden)
                                 : resultados.OrderByDescending(selectorOrden);
            }
            var itemsTotales = resultados.Count();

            resultados = resultados.Skip((paginacion.Pagina - 1) * paginacion.ItemsPorPagina).Take(paginacion.ItemsPorPagina);

            return new ListaPaginada<TransmisionBajaCtgDefinitivaDto>(resultados.ToList(), paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}
