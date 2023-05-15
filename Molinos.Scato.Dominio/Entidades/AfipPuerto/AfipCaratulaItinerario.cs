using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCaratulaItinerario : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AfipCaratula AfipCaratula { get; set; }
        public virtual string Puerto { get; set; }
    }
}
