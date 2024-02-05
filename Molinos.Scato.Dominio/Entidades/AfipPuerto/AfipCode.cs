using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCode : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string IdentificadorCaratula { get; set; }
        public virtual AfipCaratula AfipCaratula { get; set; }
        public virtual string NumeroViaje { get; set; }
        public virtual ICollection<AfipCodeCoem> IdentificadoresCOEM { get; set; }
    }
}
