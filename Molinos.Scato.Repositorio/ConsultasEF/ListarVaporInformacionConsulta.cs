using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Transactions;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Consultas;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ListarVaporInformacionConsulta : IConsultaPaginada<VaporInformacionDto>
    {
        private readonly string Buque;
        private readonly string IMO;
        private readonly List<string> TipoBuque;
        private readonly List<string> Bandera;
        private readonly Paginacion paginacion;

        public ListarVaporInformacionConsulta(Paginacion paginacion, string buque = null, string imo = null, List<string> tipoBuque = null, List<string> bandera = null)
        {

            this.Bandera = bandera;
            this.paginacion = paginacion;
            this.TipoBuque = tipoBuque;
            this.Buque = buque;
            this.IMO = imo;
        }

        public ListaPaginada<VaporInformacionDto> Ejecutar(DbContext contexto)
        {
            var hoy = DateTime.Now;
            var ayer = hoy.AddDays(-1);
            try
            {

                ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;
                var resultado = from item in contexto.Set<VaporInformacion>()
                                where item.NombreBuque.Contains(Buque) &&
                                item.ImoVapor.Contains(IMO)
                                orderby item.NombreBuque ascending
                                select new VaporInformacionDto
                                {
                                    Id = item.Id,
                                    NombreBuque = item.NombreBuque,
                                    ImoVapor = item.ImoVapor,
                                    Freeboard = item.Freeboard,
                                    PorteNeto = item.PorteNeto,
                                    PorteBruto = item.PorteBruto, 
                                    CantidadBodegasTks = item.CantidadBodegasTks,
                                    Eslora = item.Eslora,
                                    Manga = item.Manga,
                                    Puntual = item.Puntual,
                                    TipoBuque = item.TipoBuque,
                                    BanderaInformacion = item.Bandera.Nombre,
                                    ItemPorPagina = paginacion.ItemsPorPagina,
                                    Pagina = paginacion.Pagina,
                                    ItemsTotales = 0
                                };

                var resultados = resultado.ToList().Where(x => (
                (!string.IsNullOrEmpty(x.TipoBuque) && (TipoBuque == null || TipoBuque.Any(y => y.Contains(x.TipoBuque))))) &&              
                (!string.IsNullOrEmpty(x.BanderaInformacion) && (Bandera == null || Bandera.Any(y => y.Contains(x.BanderaInformacion)))));

                var itemsTotales = resultados.Count();
                resultados = resultados.Skip((paginacion.Pagina) * paginacion.ItemsPorPagina)
                    .Take(paginacion.ItemsPorPagina);
                if (resultados != null && resultados.Count() > 0)
                {
                    resultados.FirstOrDefault().ItemsTotales = itemsTotales;
                }

                return new ListaPaginada<VaporInformacionDto>(resultados.ToList(), paginacion.Pagina, paginacion.ItemsPorPagina, itemsTotales);

            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}
