using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarAcuerdosConsulta : IConsultaPaginada<Acuerdo>
    {
        public readonly List<int> tiposAcuerdos;
        public readonly DateTime? fechaInicio;
        public readonly DateTime? fechaFin;
        public readonly List<int> buques;
        public readonly List<int> muelles;
        public readonly List<int> exportadores;
        public readonly Paginacion paginacion;

        public ListarAcuerdosConsulta(Paginacion paginacion, List<int> tiposAcuerdos, DateTime? fechaInicio, DateTime? fechaFin, List<int> buques, List<int> muelles, List<int> exportadores)
        {
            this.tiposAcuerdos = tiposAcuerdos;
            this.fechaInicio = fechaInicio;
            this.fechaFin = fechaFin;
            this.buques = buques;
            this.muelles = muelles;
            this.exportadores = exportadores;
            this.paginacion = paginacion;
        }

        public ListaPaginada<Acuerdo> Ejecutar(DbContext contexto)
        {
            var acuerdos = contexto.Set<Acuerdo>();

            var query = from a in acuerdos
                        where (tiposAcuerdos.Count == 0 || tiposAcuerdos.Contains(a.AcuerdoTipo.Id))
                        // && (buques.Count == 0 || buques.Contains() // TODO: Relacion con buques
                        && (muelles.Count == 0 || muelles.Contains(a.MuelleDeCarga.Id))
                        && (exportadores.Count == 0 || exportadores.Contains(a.Exportador.Id))
                        && (fechaInicio == null || a.FechaInicio >= fechaInicio)
                        && (fechaFin == null || a.FechaFin <= fechaFin)
                        orderby a.FechaInicio descending
                        select a;

            var itemsTotales = query.Count();
            var saltear = (paginacion.Pagina - 1) * paginacion.ItemsPorPagina;

            var resultado = query.Skip(saltear).Take(paginacion.ItemsPorPagina).ToList();
            return new ListaPaginada<Acuerdo>(resultado, paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}
