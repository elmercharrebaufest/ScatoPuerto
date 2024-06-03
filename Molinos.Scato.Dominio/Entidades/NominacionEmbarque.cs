using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionEmbarque : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual Nominacion Nominacion { get; set; }
        public virtual Embarque Embarque { get; set; }
    }
}
