using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCaratulaEstado : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Estado { get; set; }
    }
}
