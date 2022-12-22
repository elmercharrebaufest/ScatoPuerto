using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Transactions;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarProgramaEmbarqueCombos : IConsultaEscalar<ProgramaEmbarqueDto>
    {       


        public ListarProgramaEmbarqueCombos()
        {
        }

        private static ProgramaEmbarqueDto ListarProgramaEmbarque(DbContext contexto)
        {

            var hoy = DateTime.Now.AddHours(24);
            ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;
            var resultado = from item in contexto.Set<Nominacion>()                            
                            select new 
                            {
                                Producto = item.NominacionDatoTecnico.MaterialPuerto.DescripcionCorta,
                                NombreBuque = item.NominacionDatoTecnico.VaporInformacion.NombreBuque,
                                Muelle = item.NominacionDatoTecnico.MuelleDeCarga.Descripcion
                            };

            return new ProgramaEmbarqueDto
            {
                ListaProducto = resultado.GroupBy(x => x.Producto).Select(x=>x.Key).ToList(),
                ListaBuque = resultado.GroupBy(x => x.NombreBuque).Select(x => x.Key).ToList(),
                ListaMuelle = resultado.GroupBy(x => x.Muelle).Select(x => x.Key).ToList()
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
