using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarExportadoresConsulta : IConsultaPaginada<ExportadorDto>
    {
        private readonly string nombre;
        private readonly Paginacion paginacion;

        public ListarExportadoresConsulta(Paginacion paginacion, string nombre)
        {
            this.paginacion = paginacion;
            this.nombre = nombre;
        }

        public ListaPaginada<ExportadorDto> Ejecutar(DbContext contexto)
        {
            ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;

            var query = contexto.Set<Exportador>()
                .Where(e => e.Habilitado &&
                    (string.IsNullOrEmpty(nombre) || e.Nombre.Contains(nombre))).OrderBy(e => e.Nombre)
                .Select(e => new ExportadorDto { Id = e.Id, Nombre = e.Nombre });

            var itemsTotales = query.Count();
            var resultados = query.Skip((paginacion.Pagina) * paginacion.ItemsPorPagina)
                    .Take(paginacion.ItemsPorPagina).ToList();

            return new ListaPaginada<ExportadorDto>(resultados.ToList(), paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}