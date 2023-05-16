using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCaratula : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string IdentificadorCaratula { get; set; }
        public virtual string CodigoAduana { get; set; }
        public virtual string CodigoLugarOperativo { get; set; }
        public virtual DateTime FechaArribo { get; set; }
        public virtual DateTime FechaZarpada { get; set; }
        public virtual string Via { get; set; }
        public virtual string NombreMedioTransporte { get; set; }
        public virtual string PuertoDestino { get; set; }
        public virtual string NumeroViaje { get; set; }
        public virtual ICollection<AfipCaratulaItinerario> Itinerario { get; set; }
    }
}
