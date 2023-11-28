using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCodeCoem : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AfipCode AfipCode { get; set; }
        public virtual AfipCoem AfipCoem { get; set; }
    }
}
