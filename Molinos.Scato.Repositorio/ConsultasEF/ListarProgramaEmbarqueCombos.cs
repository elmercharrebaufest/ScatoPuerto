using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Transactions;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarProgramaEmbarqueCombos : IConsultaEscalar<ProgramaEmbarqueDto>
    {


        public ListarProgramaEmbarqueCombos()
        {
        }

        private static ProgramaEmbarqueDto ListarProgramaEmbarque(DbContext contexto)
        {
            var hoy = DateTime.Now;
            var ayer = hoy.AddDays(-1);
            ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;
            var resultado = from item in contexto.Set<Nominacion>()
                            where (item.FechaEliminacion == null || (ayer < item.FechaEliminacion.Value && item.FechaEliminacion.Value < hoy))
                            select new
                            {
                                Producto = item.NominacionDatoTecnico.MaterialPuerto.DescripcionCortaIngles,
                                NombreBuque = item.NominacionDatoTecnico.VaporInformacion.NombreBuque,
                                Muelle = item.NominacionDatoTecnico.Muelle != null ? item.NominacionDatoTecnico.Muelle.Descripcion : item.NominacionDatoTecnico.MuelleDeCarga.Descripcion
                            };

            var muelles = resultado.Select(x => x.Muelle).Distinct().ToList()
                .GroupBy(m => m.Normalize(NormalizationForm.FormD)
                .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                .Aggregate(new StringBuilder(), (sb, c) => sb.Append(c), sb => sb.ToString())
                .ToLowerInvariant()).Select(g => g.OrderByDescending(m => m).First()).OrderBy(m => m)
                .ToList();

            return new ProgramaEmbarqueDto
            {
                ListaProducto = resultado.GroupBy(x => x.Producto).Select(x => x.Key).ToList(),
                ListaBuque = resultado.GroupBy(x => x.NombreBuque).Select(x => x.Key).ToList(),
                ListaMuelle = muelles
            };
        }

        public virtual ProgramaEmbarqueDto Ejecutar(DbContext contexto)
        {
            using (new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
            {
                return ListarProgramaEmbarque(contexto);
            }
        }

    }
}
