using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades.Administracion
{
    public class TarifaPorProductoConcepto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual TarifaPorProducto TarifaPorProducto { get; set; }
        public virtual Concepto Concepto { get; set; }
        public virtual decimal Valor { get; set; }

    }
}