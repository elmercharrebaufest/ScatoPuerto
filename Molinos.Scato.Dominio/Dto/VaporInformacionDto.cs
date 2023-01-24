using Molinos.Scato.Dominio.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class VaporInformacionDto
    {
        public int Id { get; set; }
        public VaporDto Vapor { get; set; }
        public BanderaDto Bandera { get; set; }
        public string NombreBuque { get; set; }
        public string TipoBuque { get; set; }
        public string CategoriaBuque { get; set; }
        public string ImoVapor { get; set; }
        public decimal Freeboard { get; set; }
        public decimal Eslora { get; set; }
        public decimal PorteNeto { get; set; }
        public decimal PorteBruto { get; set; }
        public decimal Manga { get; set; }
        public decimal Puntual { get; set; }
        public int CantidadBodegasTks { get; set; }
        public string BanderaInformacion { get; set; }
        public int ItemsTotales { get; set; }
        public int Pagina { get; set; }
        public int ItemPorPagina { get; set; }
        public int VaporId { get; set; }
        public string Usuario { get; set; }
        public DateTime FechaModificacion { get; set; }
    }
}