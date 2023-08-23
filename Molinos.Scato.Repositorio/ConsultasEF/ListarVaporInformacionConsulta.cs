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
        private readonly string Bandera;
        private readonly Paginacion paginacion;

        public ListarVaporInformacionConsulta(Paginacion paginacion, string buque = null, string imo = null, List<string> tipoBuque = null, string bandera = null)
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
                var resultado = from vapor in contexto.Set<Vapor>()
                                join vaporInformacion in contexto.Set<VaporInformacion>() on vapor.Id equals
                                vaporInformacion.Vapor.Id into vaporJoined
                                from vaporInfos in vaporJoined.DefaultIfEmpty()
                                where (Buque == null || vapor.Nombre.ToUpper().StartsWith(Buque)) &&
                                (IMO == null || vaporInfos.ImoVapor.ToUpper().StartsWith(IMO)) &&
                                (Bandera == null || vaporInfos.Bandera.Nombre.ToUpper().StartsWith(Bandera))
                                orderby vapor.Nombre ascending
                                select new VaporInformacionDto
                                {
                                    Id = vaporInfos != null ? vaporInfos.Id : 0,
                                    VaporId = vapor.Id,
                                    NombreBuque = vapor.Nombre,
                                    ImoVapor = vaporInfos != null ? !string.IsNullOrEmpty(vaporInfos.ImoVapor) ? vaporInfos.ImoVapor : "" : "",
                                    Freeboard = vaporInfos != null ? vaporInfos.Freeboard : 0,
                                    PorteNeto = vaporInfos != null ? vaporInfos.PorteNeto : 0,
                                    PorteBruto = vaporInfos != null ? vaporInfos.PorteBruto : 0, 
                                    CantidadBodegasTks = vaporInfos != null ? vaporInfos.CantidadBodegasTks : 0,
                                    Eslora = vaporInfos != null ? vaporInfos.Eslora : 0,
                                    Manga = vaporInfos != null ? vaporInfos.Manga : 0,
                                    Puntual = vaporInfos != null ? vaporInfos.Puntual : 0,
                                    TipoBuque = vaporInfos != null ? vaporInfos.TipoBuque : "",
                                    BanderaInformacion = vaporInfos != null ? vaporInfos.Bandera.Nombre : "",
                                    ItemPorPagina = paginacion.ItemsPorPagina,
                                    Pagina = paginacion.Pagina,
                                    ItemsTotales = 0
                                };

                var resultados = resultado.ToList().Where(x => (
                ((TipoBuque == null || TipoBuque.Any(y => y.Contains(x.TipoBuque) && !string.IsNullOrEmpty(x.TipoBuque))))));

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
