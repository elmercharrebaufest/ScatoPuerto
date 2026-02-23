using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Entidades
{
    public class OtroMuelleCarga : IIdentificable
    {
        public virtual int Id { get; set; }
        public virtual string Observacion { get; set; }
        public virtual bool FumigacionPreventiva { get; set; }
        public virtual bool FumigacionCurativa { get; set; }
        public virtual bool Senasa { get; set; }
        public virtual ICollection<OtroMuelleCargaDetalle> OtroMuelleCargaDetalles { get; set; }
    }
}
