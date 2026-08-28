using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
    [Table("CamaraAduana")]
    public class CamaraAduana
    {
        [Key]
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Url { get; set; }
        public int Posicion { get; set; }
    }
}
