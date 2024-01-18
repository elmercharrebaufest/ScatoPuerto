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
    public class ListarAfipCoemConsulta : IConsultaPaginada<AfipCoem>
    {
        private readonly int? IdCaratula;
        private readonly string Identificador;
        private readonly string Declaracion;
        private readonly string Estado;
        private readonly Paginacion paginacion;

        public ListarAfipCoemConsulta(Paginacion paginacion, int? idCaratula = null, string identificador = null, string declaracion = null, string estado = null)
        {
            this.IdCaratula = idCaratula;
            this.Identificador = identificador;
            this.Declaracion = declaracion;
            this.Estado = estado;
            this.paginacion = paginacion;
        }

        public ListaPaginada<AfipCoem> Ejecutar(DbContext contexto)
        {
            ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;
            var coems = contexto.Set<AfipCoem>();

            var query = from c in coems
                        where (IdCaratula == null || c.AfipCaratula.Id == IdCaratula)
                        && (Identificador == null || c.IdentificadorCOEM == Identificador)
                        && (Declaracion == null || c.MercaderiasSueltas.Any(m => m.IdentificadorDeclaracion.Contains(Declaracion)))
                        && (Estado == null || c.AfipCoemEstado.Codigo == Estado)
                        orderby c.FechaRegistro descending
                        select c;

            var itemsTotales = coems.Count();
            var saltear = (paginacion.Pagina - 1) * paginacion.ItemsPorPagina;

            var resultado = query.Skip(saltear).Take(paginacion.ItemsPorPagina).ToList();
            return new ListaPaginada<AfipCoem>(resultado, paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}
