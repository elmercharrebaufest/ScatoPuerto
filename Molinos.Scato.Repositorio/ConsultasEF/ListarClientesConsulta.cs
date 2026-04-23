using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarClientesConsulta : IConsultaPaginada<CoordinadorPuertoDto>
    {
        private readonly Paginacion paginacion;
        private readonly string nombre;
        private readonly string codigoSap;

        public ListarClientesConsulta(Paginacion paginacion, string nombre = null, string codigoSap = null)
        {
            this.paginacion = paginacion;
            this.nombre = nombre;
            this.codigoSap = codigoSap;
        }

        public ListaPaginada<CoordinadorPuertoDto> Ejecutar(DbContext contexto)
        {
            var hoy = DateTime.Now;
            var ayer = hoy.AddDays(-1);
            try
            {
                ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;
                var resultado = contexto.Set<CoordinadorPuerto>().Where(c =>
                ((string.IsNullOrEmpty(nombre) || c.Nombre.Contains(nombre)) &&
                 (string.IsNullOrEmpty(codigoSap) || (c.CodigoSap != null && c.CodigoSap.Contains(codigoSap)))) &&
                c.Habilitado).OrderBy(x => x.Nombre).Select(cliente => new CoordinadorPuertoDto
                {
                    Id = cliente.Id,
                    Nombre = cliente.Nombre,
                    Habilitado = cliente.Habilitado,
                    CodigoSap = cliente.CodigoSap,
                    ItemPorPagina = paginacion.ItemsPorPagina,
                    Pagina = paginacion.Pagina,
                    ItemsTotales = 0
                });
                var itemsTotales = resultado.Count();
                var resultados = resultado.Skip((paginacion.Pagina) * paginacion.ItemsPorPagina)
                    .Take(paginacion.ItemsPorPagina).ToList();

                if (resultados != null && resultados.Count() > 0)
                {
                    resultados.FirstOrDefault().ItemsTotales = itemsTotales;
                }

                return new ListaPaginada<CoordinadorPuertoDto>(resultados.ToList(), paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}