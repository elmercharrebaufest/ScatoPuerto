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
    public class ListarHistorialDeEmbarquesConsulta : IConsultaPaginada<HistorialDeBusquesDto>
    {
        private readonly int VaporId;
        private readonly string NombreBuque;
        private readonly string Destino;
        private readonly string Exportador;
        private readonly string ControlPrivado;
        private readonly DateTime? FechaInicio;
        private readonly DateTime? FechaFin;
        private readonly List<string> Productos;
        private readonly Paginacion paginacion;

        public ListarHistorialDeEmbarquesConsulta(int vaporId, string nombreBuque, string destino, string exportador, string controlPrivado, DateTime? fechaInicio, DateTime? fechaFin, List<string> productos, Paginacion paginacion)
        {
            this.VaporId = vaporId;
            this.NombreBuque = nombreBuque;
            this.Destino = destino;
            this.Exportador = exportador;
            this.ControlPrivado = controlPrivado;
            this.FechaInicio = fechaInicio;
            this.FechaFin = fechaFin;
            this.Productos = productos;
            this.paginacion = paginacion;
        }

        ListaPaginada<HistorialDeBusquesDto> IConsultaPaginada<HistorialDeBusquesDto>.Ejecutar(DbContext contexto)
        {
            try
            {
                ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;
                var query = from item in contexto.Set<LineUp>()
                            join moduloPeriodoCarga in contexto.Set<ModuloDeCargaPeriodoDeCarga>() on item.ModuloDeCarga.Id equals moduloPeriodoCarga.ModuloDeCarga.Id into moduloJoined
                            from moduloPeriodoCarga in moduloJoined.DefaultIfEmpty()
                            join moduloDeCargaPlanillaDeTurno in contexto.Set<ModuloDeCargaPlanillaDeTurnos>() on moduloPeriodoCarga.Id equals moduloDeCargaPlanillaDeTurno.ModuloDeCarga.Id into moduloDeCargaPlanillaDeTurnoJoined
                            from moduloDeCargaPlanillaDeTurno in moduloDeCargaPlanillaDeTurnoJoined.DefaultIfEmpty()

                            where item.PlanoDeCarga != null && item.Embarque != null && item.ModuloDeCarga != null &&
                            (item.Embarque.Vapor.Id == this.VaporId && item.Embarque.SanBenito == true) || (this.VaporId == 0 && item.Embarque.SanBenito == true &&
                            (moduloPeriodoCarga != null && moduloPeriodoCarga.FechaDesamarro.HasValue &&
                            (this.FechaInicio == null || moduloPeriodoCarga.FechaDesamarro.Value >= this.FechaInicio.Value) &&
                            (this.FechaFin == null || moduloPeriodoCarga.FechaDesamarro.Value <= this.FechaFin.Value) &&
                            (item.Embarque.Ubicacion == 1) && // Solo debe mostrarse los embarque que han zarpado
                            (String.IsNullOrEmpty(this.NombreBuque) || item.Embarque.Vapor.Nombre.ToUpper().Contains(this.NombreBuque.ToUpper()))))
                            
                            orderby moduloPeriodoCarga.FechaDesamarro descending

                            select new HistorialDeBusquesDto
                            {
                                LineUpId = item.Id,
                                NombreBuque = item.Embarque.Vapor.Nombre,
                                EmbarqueId = item.Embarque.Id,
                                VaporId = item.Embarque.Vapor.Id,
                                Destino = item.Embarque.Destino != null ? item.Embarque.Destino.Nombre : "",
                                ModuloDeCargaId = item.ModuloDeCarga != null ? item.ModuloDeCarga.Id : 0,
                                FechaDesamarro = moduloPeriodoCarga != null ? moduloPeriodoCarga.FechaDesamarro : null,
                                FechaAmarro = moduloPeriodoCarga != null ? moduloPeriodoCarga.FechaAmarro : null,
                                HoraAmarro = moduloPeriodoCarga != null ? moduloPeriodoCarga.HoraAmarro : "",
                                HoraDesamarro = moduloPeriodoCarga != null ? moduloPeriodoCarga.HoraDesamarro : "",
                                EsLiquido = item.Embarque.EsLiquido,
                                Productos = item.Embarque.MaterialPuertoCantidad.Select(x => x.MaterialPuerto.DescripcionCorta),
                                AgentesControlPrivado = from agente in contexto.Set<AgenteControlPrivado>()
                                                        where item.PlanoDeCarga.AgentesControlPrivado.Any(x => x.Id == agente.Id)
                                                        select
                                                      new AgenteControlPrivadoDto()
                                                      {
                                                          Id = agente.Id,
                                                          Nombre = agente.Nombre,
                                                          Apellido = agente.Apellido
                                                      },
                                ProductoExportador =
                                    (from planillaDeTurnoLiquido in contexto.Set<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>()
                                     where planillaDeTurnoLiquido.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id == item.ModuloDeCarga.Id
                                     select new ProductoExportadorDto()
                                     {
                                         Exportador_Id = planillaDeTurnoLiquido.Exportador != null ? planillaDeTurnoLiquido.Exportador.Id : 0,
                                         MaterialPuerto_Id = planillaDeTurnoLiquido.MaterialPuerto != null ? planillaDeTurnoLiquido.MaterialPuerto.Id : 0,
                                         NombreExportador = planillaDeTurnoLiquido.Exportador != null ? planillaDeTurnoLiquido.Exportador.Nombre : "",
                                         NombreMaterial = planillaDeTurnoLiquido.MaterialPuerto != null ? planillaDeTurnoLiquido.MaterialPuerto.DescripcionCorta : "",
                                         Toneladas = planillaDeTurnoLiquido.Cantidad > 0 ? (planillaDeTurnoLiquido.Cantidad / 1000) : planillaDeTurnoLiquido.Cantidad,
                                         Destino = planillaDeTurnoLiquido.Destino != null ? planillaDeTurnoLiquido.Destino.Nombre : "",
                                     }).Union
                                    (from planillaDeTurnoSolido in contexto.Set<ModuloDeCargaPlanillaDeTurnosDetallesSolido>()
                                     where planillaDeTurnoSolido.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id == item.ModuloDeCarga.Id
                                     select new ProductoExportadorDto()
                                     {
                                         Exportador_Id = planillaDeTurnoSolido.Exportador != null ? planillaDeTurnoSolido.Exportador.Id : 0,
                                         MaterialPuerto_Id = planillaDeTurnoSolido.MaterialPuerto != null ? planillaDeTurnoSolido.MaterialPuerto.Id : 0,
                                         NombreExportador = planillaDeTurnoSolido.Exportador != null ? planillaDeTurnoSolido.Exportador.Nombre : "",
                                         NombreMaterial = planillaDeTurnoSolido.MaterialPuerto != null ? planillaDeTurnoSolido.MaterialPuerto.DescripcionCorta : "",
                                         Toneladas = planillaDeTurnoSolido.Cantidad > 0 ? (planillaDeTurnoSolido.Cantidad / 1000) : planillaDeTurnoSolido.Cantidad,
                                         Destino = planillaDeTurnoSolido.Destino != null ? planillaDeTurnoSolido.Destino.Nombre : "",
                                     }),
                                NombreMuelle = item.Embarque.SanBenito ? "San Benito" :
                                item.Embarque.Vicentin ? "Vicentin" : item.Embarque.Noryon ? "Noryon" : item.Embarque.OtrosMuelles ? "Otros Muelles" : "",
                                ItemsPorPagina = paginacion.ItemsPorPagina,
                                Pagina = paginacion.Pagina,
                                ItemsTotales = 0
                            };

                var filteredQuery = query.ToList().Where(x => (String.IsNullOrEmpty(this.Exportador) || x.ProductoExportador.Any(y => y.NombreExportador.ToUpper().Contains(this.Exportador.ToUpper()))) &&
                 (String.IsNullOrEmpty(this.Destino) || x.ProductoExportador.Any(y => y.Destino.ToUpper().Contains(this.Destino.ToUpper()))) &&
                 (this.Productos == null || x.ProductoExportador.Any(y => this.Productos.Contains(y.NombreMaterial))) &&
                 (String.IsNullOrEmpty(this.ControlPrivado) || x.AgentesControlPrivado.Any(y => y.name.ToUpper().Contains(this.ControlPrivado.ToUpper())))
                 ).GroupBy(x => x.EmbarqueId).Select(x => x.FirstOrDefault());

                var itemsTotales = filteredQuery.Count();
                var resultados = filteredQuery.Skip((paginacion.Pagina) * paginacion.ItemsPorPagina)
                    .Take(paginacion.ItemsPorPagina).ToList();

                if (resultados != null && resultados.Count() > 0)
                {
                    resultados.FirstOrDefault().ItemsTotales = itemsTotales;
                }

                return new ListaPaginada<HistorialDeBusquesDto>(resultados.ToList(), paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}