using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarProductosConsulta : IConsultaPaginada<MaterialPuertoDto>
    {
        private readonly string nombre;
        private readonly Paginacion paginacion;

        public ListarProductosConsulta(Paginacion paginacion, string nombre)
        {
            this.paginacion = paginacion;
            this.nombre = nombre;
        }

        public ListaPaginada<MaterialPuertoDto> Ejecutar(DbContext contexto)
        {
            ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;

            var query = contexto.Set<MaterialPuerto>()
                .Where(e => e.Activo &&
                    (string.IsNullOrEmpty(nombre) || e.Descripcion.ToUpper().Contains(nombre.ToUpper()))).OrderBy(e => e.Descripcion)
                .Select(e => new MaterialPuertoDto { Id = e.Id, Descripcion = e.Descripcion, EsLiquido = e.EsLiquido });

            var itemsTotales = query.Count();
            var resultados = query.Skip((paginacion.Pagina - 1) * paginacion.ItemsPorPagina)
                    .Take(paginacion.ItemsPorPagina).ToList();

            return new ListaPaginada<MaterialPuertoDto>(resultados.ToList(), paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}