using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Entidades
{
    public class Muelle : IIdentificable
    {
        public virtual int Id { get; set; }
        public virtual string Descripcion { get; set; }
        public virtual string SectorResponsableDeCargas { get; set; }
        public virtual string FormaIngresoCarga { get; set; }
        public virtual bool IngresoManual { get; set; }
        public virtual ICollection<Embarque> Embarque { get; set; }
    }
}
