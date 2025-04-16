using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NotificacionAdministracion : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }

        public virtual string Mensaje { get; set; }
        public virtual DateTime? Fecha { get; set; }
        public virtual DateTime? FechaEliminacion { get; set; }
        public virtual string UsuarioEliminacion { get; set; }
    }
}