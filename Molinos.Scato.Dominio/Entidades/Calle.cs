using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class Calle : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        [Required]
        public virtual string Nombre { get; set; }
        [Required]
        public virtual string Codigo { get; set; }
        [Required]
        public virtual int CentroId { get; set; }
    }
}
