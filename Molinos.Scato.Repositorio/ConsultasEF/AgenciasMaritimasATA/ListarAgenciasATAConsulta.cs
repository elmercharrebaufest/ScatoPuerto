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

            var queryAgencias = contexto.Set<AgenciaMaritimaPuerto>()
                .Where(agencia => agencia.Activa &&
                    (string.IsNullOrEmpty(Nombre) || agencia.Nombre.Contains(Nombre)) &&
                    (string.IsNullOrEmpty(Cuit) || agencia.Cuit.Contains(Cuit)))
                .Select(agencia => new AgenciaMaritimaATADto { Id = agencia.Id, Nombre = agencia.Nombre, Cuit = agencia.Cuit, Tipo = 1 });

            var queryAta = contexto.Set<ATAPuerto>()
                .Where(ata => ata.Activa &&
                    (string.IsNullOrEmpty(Nombre) || ata.Nombre.Contains(Nombre)) &&
                    (string.IsNullOrEmpty(Cuit) || ata.Cuit.Contains(Cuit)))
                .Select(ata => new AgenciaMaritimaATADto { Id = ata.Id, Nombre = ata.Nombre, Cuit = ata.Cuit, Tipo = 2 });

            var query = queryAgencias.Concat(queryAta).Where(a => Tipo == 0 || a.Tipo == Tipo).OrderBy(a => a.Nombre);
            var itemsTotales = query.Count();
            var saltear = (Paginacion.Pagina - 1) * Paginacion.ItemsPorPagina;

            var queryFinal = query.Skip(saltear);
            if (Paginacion.ItemsPorPagina > 0)
            {
                queryFinal = queryFinal.Take(Paginacion.ItemsPorPagina);
            }

            var resultado = queryFinal.ToList();
            return new ListaPaginada<AgenciaMaritimaATADto>(resultado, Paginacion.Pagina, Paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}
