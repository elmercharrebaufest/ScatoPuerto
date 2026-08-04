using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
    [Table("VaporInformacion")]
    public class VaporInformacion : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }

        public virtual string NombreBuque { get; set; }
        public virtual string TipoBuque { get; set; }
        public virtual string CategoriaBuque { get; set; }
        public virtual string ImoVapor { get; set; }
        public virtual decimal Freeboard { get; set; }
        public virtual decimal Eslora { get; set; }
        public virtual decimal PorteNeto { get; set; }
        public virtual decimal PorteBruto { get; set; }
        public virtual decimal Manga { get; set; }
        public virtual decimal Puntual { get; set; }
        public virtual int CantidadBodegasTks { get; set; }
        public bool? EnSap { get; set; }

        public virtual Bandera Bandera { get; set; }
        public virtual Vapor Vapor { get; set; }
        public virtual string ShipParticular { get; set; }
    }
}