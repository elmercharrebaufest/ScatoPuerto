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
            var agencias = contexto.Set<AgenciaMaritimaPuerto>()
                .Where(agencia => agencia.Activa &&
                    (string.IsNullOrEmpty(Nombre) || agencia.Nombre.Contains(Nombre)) &&
                    (string.IsNullOrEmpty(Cuit) || agencia.Cuit.Contains(Cuit)))
                .Select(agencia => new AgenciaMaritimaATADto 
                { 
                    Id = agencia.Id, 
                    Nombre = agencia.Nombre, 
                    Cuit = agencia.Cuit, 
                    CodigoSap = agencia.CodigoSap, 
                    Tipo = 1 
                })
                .ToList();

            // Obtener los IDs de las ATAs que están vinculadas a alguna agencia
            var atasVinculadas = contexto.Set<AgenciaMaritimaPuerto>()
                .Where(a => a.Activa && a.AtaPuerto != null)
                .Select(a => a.AtaPuerto.Id)
                .ToList();

            // Obtener los nombres de todas las agencias marítimas (normalizados)
            var nombresAgencias = agencias
                .Select(a => a.Nombre.Trim().ToUpper())
                .ToHashSet();

            // Obtener las ATAs que NO están vinculadas a ninguna agencia
            var atas = contexto.Set<ATAPuerto>()
                .Where(ata => ata.Activa &&
                    (string.IsNullOrEmpty(Nombre) || ata.Nombre.Contains(Nombre)) &&
                    (string.IsNullOrEmpty(Cuit) || ata.Cuit.Contains(Cuit)))
                .ToList() // Traemos a memoria para poder hacer los filtros con HashSet
                .Where(ata => !atasVinculadas.Contains(ata.Id) && 
                             !nombresAgencias.Contains(ata.Nombre.Trim().ToUpper()))
                .Select(ata => new AgenciaMaritimaATADto 
                { 
                    Id = ata.Id, 
                    Nombre = ata.Nombre, 
                    Cuit = ata.Cuit, 
                    CodigoSap = null, 
                    Tipo = 2 
                })
                .ToList();

            // Combinar agencias y ATAs
            var todosLosItems = agencias.Concat(atas).ToList();

            // Eliminar duplicados por nombre (case-insensitive y trim) - por si acaso
            var sinDuplicados = todosLosItems
                .GroupBy(x => x.Nombre.Trim().ToUpper())
                .Select(g => g.OrderBy(x => x.Tipo).ThenBy(x => x.Id).First())
                .OrderBy(x => x.Nombre)
                .ToList();

            var itemsTotales = sinDuplicados.Count();
            var saltear = (Paginacion.Pagina - 1) * Paginacion.ItemsPorPagina;

            var resultado = sinDuplicados.Skip(saltear);
            if (Paginacion.ItemsPorPagina > 0)
            {
                resultado = resultado.Take(Paginacion.ItemsPorPagina);
            }

            return new ListaPaginada<AgenciaMaritimaATADto>(resultado.ToList(), Paginacion.Pagina, Paginacion.ItemsPorPagina, itemsTotales);
        }
    }
}
