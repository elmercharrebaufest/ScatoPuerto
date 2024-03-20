using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarClientesConsulta : IConsultaPaginada<CoordinadorPuertoDto>
    {
        private readonly Paginacion paginacion;
        private readonly string nombre;

        public ListarClientesConsulta(Paginacion paginacion, string nombre = null)
        {
            this.paginacion = paginacion;
            this.nombre = nombre;
        }
        public ListaPaginada<CoordinadorPuertoDto> Ejecutar(DbContext contexto)
        {
            var hoy = DateTime.Now;
            var ayer = hoy.AddDays(-1);
            try
            {

                ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;
                var resultado = from cliente in contexto.Set<CoordinadorPuerto>()
                where ((nombre == null || cliente.Nombre.ToUpper().Contains(nombre)) &&
                (cliente.Habilitado)) 
                                orderby cliente.Nombre ascending
                                select new CoordinadorPuertoDto
                                {
                                    Id = cliente.Id,
                                    Nombre = cliente.Nombre,
                                    Habilitado = cliente.Habilitado,
                                    ItemPorPagina = paginacion.ItemsPorPagina,
                                    Pagina = paginacion.Pagina,
                                    ItemsTotales = 0
                                };

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
