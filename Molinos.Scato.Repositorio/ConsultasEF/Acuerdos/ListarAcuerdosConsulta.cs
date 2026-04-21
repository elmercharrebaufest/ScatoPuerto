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
            var query = contexto.Set<Acuerdo>().AsQueryable();

            if (tiposAcuerdos.Any())
            {
                query = query.Where(a => tiposAcuerdos.Contains(a.AcuerdoTipo.Id));
            }

            if (buques.Any())
            {
                query = query.Where(a => a.AcuerdoDetalles.Any(ad => ad.AcuerdoEmbarques.Any(ae => buques.Contains(ae.Embarque.Vapor.Id))));
            }

            if (muelles.Any())
            {
                query = query.Where(a => muelles.Contains(a.Muelle.Id));
            }

            if (exportadores.Any())
            {
                query = query.Where(a => exportadores.Contains(a.Exportador.Id));
            }

            if (fechaInicio != null)
            {
                query = query.Where(a => a.FechaInicio >= fechaInicio);
            }

            if (fechaFin != null)
            {
                query = query.Where(a => a.FechaFin <= fechaFin);
            }

            query = query.OrderByDescending(a => a.FechaInicio);

            var itemsTotales = query.Count();
            var saltear = (paginacion.Pagina - 1) * paginacion.ItemsPorPagina;

            var resultado = query.Skip(saltear).Take(paginacion.ItemsPorPagina).ToList();

            // NOTA: El estado y las relaciones de embarques se calculan en AcuerdosMappingProfile.cs

            return new ListaPaginada<Acuerdo>(resultado, paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}
