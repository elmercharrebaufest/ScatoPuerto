using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ConfiguracionDocumento
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual Nominacion Nominacion { get; set; }
        public virtual CoordinadorPuerto CoordinadorPuerto { get; set; }
        public virtual Destino Destino { get; set; }
        public virtual int CantidadDeJuegos { get; set; }
        public virtual ICollection<NominacionDocumento> NominacionDocumentos { get; set; }
    }
}
