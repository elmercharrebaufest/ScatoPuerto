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

            var dbAgenciaMaritimaPuerto = contexto.Set<AgenciaMaritimaPuerto>();
            var dbAtaPuerto = contexto.Set<ATAPuerto>();

            var queryAgencias = from agencia in dbAgenciaMaritimaPuerto
                                where agencia.Activa &&
                                (string.IsNullOrEmpty(this.Nombre) || agencia.Nombre.Contains(this.Nombre)) &&
                                (string.IsNullOrEmpty(this.Cuit) || agencia.Cuit.Contains(this.Cuit))
                                select new AgenciaMaritimaATADto { Id = agencia.Id, Nombre = agencia.Nombre, Cuit = agencia.Cuit, Tipo = 1 };

            var queryATA = from ata in dbAtaPuerto
                           where ata.Activa &&
                           (string.IsNullOrEmpty(this.Nombre) || ata.Nombre.Contains(this.Nombre)) &&
                           (string.IsNullOrEmpty(this.Cuit) || ata.Cuit.Contains(this.Cuit))
                           select new AgenciaMaritimaATADto { Id = ata.Id, Nombre = ata.Nombre, Cuit = ata.Cuit, Tipo = 2 };

            var query = queryAgencias.Concat(queryATA).Where(a => Tipo == 0 || a.Tipo == Tipo).OrderBy(a => a.Nombre);
            var itemsTotales = query.Count();
            var saltear = (Paginacion.Pagina - 1) * Paginacion.ItemsPorPagina;

            var resultado = query.Skip(saltear).Take(Paginacion.ItemsPorPagina).ToList();
            return new ListaPaginada<AgenciaMaritimaATADto>(resultado, Paginacion.Pagina, Paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}
