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
    public class ListarAfipCaratulaConsulta : IConsultaPaginada<AfipCaratula>
    {
        private readonly DateTime? FechaArribo;
        private readonly string Buque;
        private readonly string Identificador;
        private readonly string Estado;
        private readonly Paginacion paginacion;

        public ListarAfipCaratulaConsulta(Paginacion paginacion, DateTime? fechaArribo = null, string buque = null, string identificador = null, string estado = null)
        {
            this.FechaArribo = fechaArribo;
            this.Buque = buque?.ToUpper();
            this.Identificador = identificador;
            this.Estado = estado;
            this.paginacion = paginacion;
        }

        public ListaPaginada<AfipCaratula> Ejecutar(DbContext contexto)
        {
            ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;
            var caratulas = contexto.Set<AfipCaratula>();

            var query = from c in caratulas
                        where (FechaArribo == null || (c.FechaArribo.Month == FechaArribo.Value.Month && c.FechaArribo.Year == FechaArribo.Value.Year))
                            && (Buque == null || c.NombreMedioTransporte.ToUpper().Contains(Buque) || c.IdentificadorBuque.Contains(Buque))
                            && (Identificador == null || c.IdentificadorCaratula.Contains(Identificador))
                            && (Estado == null || c.Estado == Estado)
                        orderby c.FechaRegistro descending
                        select c;

            var itemsTotales = caratulas.Count();
            var saltear = (paginacion.Pagina - 1) * paginacion.ItemsPorPagina;

            var resultado = query.Skip(saltear).Take(paginacion.ItemsPorPagina).ToList();
            return new ListaPaginada<AfipCaratula>(resultado, paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}
