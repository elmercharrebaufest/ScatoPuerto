using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Transactions;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarHistorialDeEmbarquesConsulta : IConsulta<HistorialDeBusquesDto>
    {
        private readonly int VaporId;
        private readonly string NombreBuque;
        private readonly string Destino;
        private readonly string Exportador;
        private readonly string ControlPrivado;
        private readonly DateTime? FechaInicio;
        private readonly DateTime? FechaFin;
        private readonly List<string> Productos;


        public ListarHistorialDeEmbarquesConsulta(int vaporId, string nombreBuque, string destino, string exportador, string controlPrivado, DateTime? fechaInicio, DateTime? fechaFin, List<string> productos = null)
        {
            this.VaporId = vaporId;
            this.NombreBuque = nombreBuque;
            this.Destino = destino;
            this.Exportador = exportador;
            this.ControlPrivado = controlPrivado;
            this.FechaInicio = fechaInicio;
            this.FechaFin = fechaFin;
            this.Productos = productos;
        }

        private static List<HistorialDeBusquesDto> ListarHistorialDeEmbarques(DbContext contexto, int vaporId, string nombreBuque, string destino, string exportador, string controlPrivado, DateTime? fechaInicio, DateTime? fechaFin, List<string> productos = null)
        {


            ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;
            var resultado = from item in contexto.Set<LineUp>()
                            join moduloPeriodoCarga in contexto.Set<ModuloDeCargaPeriodoDeCarga>() on item.ModuloDeCarga.Id equals moduloPeriodoCarga.ModuloDeCarga.Id into moduloJoined
                            from moduloPeriodoCarga in moduloJoined.DefaultIfEmpty()
                            join moduloDeCargaPlanillaDeTurno in contexto.Set<ModuloDeCargaPlanillaDeTurnos>() on moduloPeriodoCarga.Id equals moduloDeCargaPlanillaDeTurno.ModuloDeCarga.Id into moduloDeCargaPlanillaDeTurnoJoined
                            from moduloDeCargaPlanillaDeTurno in moduloDeCargaPlanillaDeTurnoJoined.DefaultIfEmpty()

                            where (item.Embarque.Vapor.Id == vaporId && item.Embarque.SanBenito == true) || (vaporId == 0 && item.Embarque.SanBenito == true &&
                            (moduloPeriodoCarga != null && moduloPeriodoCarga.FechaDesamarro.HasValue &&
                            (fechaInicio == null || moduloPeriodoCarga.FechaDesamarro.Value >= fechaInicio.Value) &&
                            (fechaFin == null || moduloPeriodoCarga.FechaDesamarro.Value <= fechaFin.Value) &&
                            (String.IsNullOrEmpty(nombreBuque) || item.Embarque.Vapor.Nombre.ToUpper().Contains(nombreBuque.ToUpper()))))

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
                                AgenciaControlPrivado = (from agenteControlPrivado in contexto.Set<AgenteControlPrivado>()
                                                         where item.PlanoDeCarga.AgentesControlPrivado.Contains(agenteControlPrivado)
                                                         orderby agenteControlPrivado.Id descending
                                                         select agenteControlPrivado.Nombre).FirstOrDefault(),
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
                                item.Embarque.Vicentin ? "Vicentin" : item.Embarque.Noryon ? "Noryon" : item.Embarque.OtrosMuelles ? "Otros Muelles" : ""
                            };
         
            return resultado.ToList().Where(x => (String.IsNullOrEmpty(exportador) || String.IsNullOrEmpty(destino) ||
                                         (x.ProductoExportador != null && x.ProductoExportador
                                            .Any(y => y.NombreExportador.ToUpper().StartsWith(exportador.ToUpper()) 
                                            && y.Destino.ToUpper().StartsWith(destino.ToUpper()))) &&
                                         (productos == null || (x.ProductoExportador.Any(y => productos.Contains(y.NombreMaterial))) &&
                                         (String.IsNullOrEmpty(controlPrivado) || x.AgenciaControlPrivado.ToUpper().StartsWith(controlPrivado.ToUpper()))
                                           ))).ToList();
        }

        public virtual List<HistorialDeBusquesDto> Ejecutar(DbContext contexto)
        {
            using (new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
            {
                return ListarHistorialDeEmbarques(contexto, VaporId, NombreBuque, Destino, Exportador, ControlPrivado, FechaInicio, FechaFin);
            }
        }
    }
}
