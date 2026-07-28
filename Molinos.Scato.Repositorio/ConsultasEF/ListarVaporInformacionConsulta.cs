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
                                (Bandera == null || vaporInfos.Bandera.Nombre.ToUpper().StartsWith(Bandera)) &&
                                (vapor.Habilitado == true)
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
                                     EnSap = vaporInfos != null ? vaporInfos.EnSap : null,
                                     MensajeSap = contexto.Set<TransaccionesSAP>()
                                        .Where(t => t.Entidad == "VaporInformacion" && vaporInfos != null && t.Entidad_Id == vaporInfos.Id)
                                        .OrderByDescending(t => t.Id)
                                        .Select(t => t.Estado == "Error" ? t.ResponseSAP : string.Empty)
                                        .FirstOrDefault(),
                                    ItemPorPagina = paginacion.ItemsPorPagina,
                                    Pagina = paginacion.Pagina,
                                    ItemsTotales = 0
                                };

                var listaResultado = resultado.ToList();

                // Obtener las últimas transacciones SAP para determinar EnProceso
                var vaporInfoIds = listaResultado.Where(x => x.Id > 0).Select(x => (long)x.Id).ToList();
                var ultimasTransacciones = contexto.Set<TransaccionesSAP>()
                    .Where(t => t.Entidad == "VaporInformacion" && vaporInfoIds.Contains(t.Entidad_Id))
                    .GroupBy(t => t.Entidad_Id)
                    .Select(g => g.OrderByDescending(t => t.Id).FirstOrDefault())
                    .ToList();

                var ahora = DateTime.Now;

                foreach (var item in listaResultado)
                {
                    item.MensajeSap = ObtenerMensajeSap(item.MensajeSap);

                    // Calcular EnProceso basado en la última transacción SAP
                    var ultimaTransaccion = ultimasTransacciones.FirstOrDefault(t => t.Entidad_Id == item.Id);
                    bool enProceso = false;
                    if (ultimaTransaccion != null)
                    {
                        if (ultimaTransaccion.Estado == "Pendiente")
                        {
                            enProceso = true;
                        }
                        else if (ultimaTransaccion.Estado == "Error" && ultimaTransaccion.Reintento < 2)
                        {
                            if ((ahora - ultimaTransaccion.FechaCreacion).TotalSeconds < 60)
                            {
                                enProceso = true;
                            }
                        }
                    }
                    item.EnProceso = enProceso;
                }

                var resultados = listaResultado.Where(x => (
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

        private string ObtenerMensajeSap(string responseSap)
        {
            if (string.IsNullOrEmpty(responseSap))
            {
                return string.Empty;
            }

            const string tagInicio = "<EX_MESSAGE>";
            const string tagFin = "</EX_MESSAGE>";
            var inicio = responseSap.IndexOf(tagInicio, StringComparison.OrdinalIgnoreCase);
            var fin = responseSap.IndexOf(tagFin, StringComparison.OrdinalIgnoreCase);

            if (inicio >= 0 && fin > inicio)
            {
                inicio += tagInicio.Length;
                return responseSap.Substring(inicio, fin - inicio);
            }

            const string exceptionInicio = "<Exception>";
            const string exceptionFin = "</Exception>";
            inicio = responseSap.IndexOf(exceptionInicio, StringComparison.OrdinalIgnoreCase);
            fin = responseSap.IndexOf(exceptionFin, StringComparison.OrdinalIgnoreCase);

            if (inicio >= 0 && fin > inicio)
            {
                inicio += exceptionInicio.Length;
                return responseSap.Substring(inicio, fin - inicio);
            }

            return responseSap;
        }
    }
}
