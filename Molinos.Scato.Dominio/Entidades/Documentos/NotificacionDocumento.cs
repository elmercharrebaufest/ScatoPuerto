using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NotificacionDocumento : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Mensaje { get; set; }
        public virtual DateTime? Fecha { get; set; }
        public virtual DateTime? FechaEliminacion { get; set; }
        public virtual string UsuarioEliminacion { get; set; }
    }
}
