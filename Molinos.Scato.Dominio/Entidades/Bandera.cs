using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class Bandera
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Abreviatura { get; set; }
        public virtual string Nombre { get; set; }
        public ICollection<Destino> Destinos { get; set; }
    }
}
