using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AcuerdoTipoConfiguracion : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AcuerdoTipo AcuerdoTipo { get; set; }
        public virtual bool EsSanBenito { get; set; }
        public virtual bool EsMOA { get; set; }
        public virtual ICollection<AcuerdoTipoConfiguracionConcepto> AcuerdoTipoConfiguracionConceptos { get; set; }
    }
}
