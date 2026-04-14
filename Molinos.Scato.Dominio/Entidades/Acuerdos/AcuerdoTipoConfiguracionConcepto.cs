using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AcuerdoTipoConfiguracionConcepto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AcuerdoTipoConfiguracion AcuerdoTipoConfiguracion { get; set; }
        public virtual Concepto Concepto { get; set; }
        public virtual bool Obligatorio { get; set; }
    }
}
