using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarProductosConsulta : IConsultaPaginada<MaterialPuertoDto>
    {
        private readonly string nombre;
        private readonly List<string> listTipoDeProducto;
        private readonly List<string> listDocumentoTipo;
        private readonly Paginacion paginacion;

        public ListarProductosConsulta(Paginacion paginacion, string nombre, List<string> tipoDeProducto = null, List<string> documentoTipo = null)
        {
            this.paginacion = paginacion;
            this.nombre = nombre;
            this.listTipoDeProducto = tipoDeProducto != null ? tipoDeProducto : new List<string>();
            this.listDocumentoTipo = documentoTipo != null ? documentoTipo : new List<string>();
        }

        public ListaPaginada<MaterialPuertoDto> Ejecutar(DbContext contexto)
        {
            ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;

            bool esSolido = false;
            bool esLiquido = false;

            foreach(var tipoProducto in this.listTipoDeProducto)
            {
                if (tipoProducto.Equals("1")) esLiquido = true;
                if (tipoProducto.Equals("2")) esSolido = true;
            }
            var query = contexto.Set<MaterialPuerto>()
                .Where(e => e.Activo &&
                    (string.IsNullOrEmpty(nombre) || e.Descripcion.ToUpper().Contains(nombre.ToUpper()))).OrderBy(e => e.Descripcion)
                .Select(e => new MaterialPuertoDto { Id = e.Id, Descripcion = e.Descripcion, EsLiquido = e.EsLiquido }).ToList();
            if (esLiquido || esSolido)
            {
                if (esLiquido)
                    query = query.Where(x => x.EsLiquido == esLiquido).ToList();

                if (esSolido)
                    query = query.Where(x => x.EsLiquido == !esSolido).ToList();
            }

            if (listDocumentoTipo.Count > 0)
            {
                var productosPorDocumento = contexto.Set<DocumentoMaterialPuerto>().ToList();
                productosPorDocumento = productosPorDocumento.Where(x => listDocumentoTipo.Any(y => y.Contains(x.Documento.DocumentoTipo.Id.ToString().Trim()))).ToList();
                query = query.Where(x=> productosPorDocumento.Any(y => y.MaterialPuerto.Id.ToString().Contains(x.Id.ToString()) )).ToList();
            }

            var itemsTotales = query.Count();
            var resultados = query.Skip((paginacion.Pagina - 1) * paginacion.ItemsPorPagina)
                    .Take(paginacion.ItemsPorPagina).ToList();

            return new ListaPaginada<MaterialPuertoDto>(resultados.ToList(), paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}