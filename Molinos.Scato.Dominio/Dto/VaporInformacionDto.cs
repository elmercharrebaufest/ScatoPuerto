using System;

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
        public string BanderaInformacion { get; set; } = null;
        public int ItemsTotales { get; set; } = 0;
        public int Pagina { get; set; } = 0;
        public int ItemPorPagina { get; set; } = 0;
        public int VaporId { get; set; } = 0;
        public string Usuario { get; set; } = null;
        public DateTime FechaModificacion { get; set; } = DateTime.Now;
        public string ShipParticular { get; set; }
        public byte[] Archivo { get; set; }
        public bool? EnSap { get; set; }
        public string MensajeSap { get; set; }
    }
}