using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class TipoDeCalidad : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Descripcion { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual bool Activo { get; set; }
    }
}
