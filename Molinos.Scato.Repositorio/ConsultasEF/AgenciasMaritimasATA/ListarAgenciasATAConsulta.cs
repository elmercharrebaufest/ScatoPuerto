using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarAgenciasATAConsulta : IConsultaPaginada<AgenciaMaritimaATADto>
    {
        private readonly string Nombre;
        private readonly string Cuit;
        private readonly int Tipo;
        private readonly Paginacion Paginacion;

        public ListarAgenciasATAConsulta(Paginacion paginacion, string nombre, string cuit, int tipo)
        {
            this.Paginacion = paginacion;
            this.Nombre = nombre;
            this.Cuit = cuit;
            this.Tipo = tipo;
        }

        public ListaPaginada<AgenciaMaritimaATADto> Ejecutar(DbContext contexto)
        {
            ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;

            // Obtener todas las Agencias Marítimas activas
            var query = contexto.Set<AgenciaMaritimaPuerto>()
                .Where(agencia => agencia.Activa &&
                    (string.IsNullOrEmpty(Nombre) || agencia.Nombre.Contains(Nombre)) &&
                    (string.IsNullOrEmpty(Cuit) || agencia.Cuit.Contains(Cuit)))
                .OrderBy(agencia => agencia.Nombre);

            var itemsTotales = query.Count();
            var saltear = (Paginacion.Pagina - 1) * Paginacion.ItemsPorPagina;

            var resultado = query.Skip(saltear);
            if (Paginacion.ItemsPorPagina > 0)
            {
                resultado = resultado.Take(Paginacion.ItemsPorPagina);
            }

            var agencias = resultado
                .Select(agencia => new AgenciaMaritimaATADto 
                { 
                    Id = agencia.Id, 
                    Nombre = agencia.Nombre, 
                    Cuit = agencia.Cuit, 
                    CodigoSap = agencia.CodigoSap, 
                    Tipo = 1 
                })
                .ToList();

            return new ListaPaginada<AgenciaMaritimaATADto>(agencias, Paginacion.Pagina, Paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}
