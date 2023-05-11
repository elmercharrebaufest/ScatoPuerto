using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCaratulaItinerario
    {
        public virtual AfipCaratula Caratula { get; set; }
        public string Puerto { get; set; }
    }
}
