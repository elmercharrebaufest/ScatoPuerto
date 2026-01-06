using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AcuerdoDetalleConcepto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AcuerdoDetalle AcuerdoDetalle { get; set; }
        public virtual Concepto Concepto { get; set; }
    }
}
