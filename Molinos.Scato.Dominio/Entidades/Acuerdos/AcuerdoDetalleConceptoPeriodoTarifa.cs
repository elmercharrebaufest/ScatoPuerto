using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AcuerdoDetalleConceptoPeriodoTarifa : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AcuerdoDetalleConcepto AcuerdoDetalleConcepto { get; set; }
        public virtual AcuerdoPeriodo AcuerdoPeriodo { get; set; }
        public virtual decimal ValorTarifa { get; set; }
    }
}
