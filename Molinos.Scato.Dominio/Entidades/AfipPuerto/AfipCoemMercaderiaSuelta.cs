using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCoemMercaderiaSuelta : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AfipCoem AfipCoem { get; set; }
        public virtual string IdentificadorDeclaracion { get; set; }
        public virtual string CuitATA { get; set; }
        public virtual ICollection<AfipCoemMercaderiaSueltaEmbalaje> Embalajes { get; set; }
    }
}
