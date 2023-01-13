using System;
using System.ComponentModel.DataAnnotations;
using Molinos.Scato.Dominio.Enums;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NotificacionProgramaDeEmbarque : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Mensaje { get; set; }
        public virtual DateTime Fecha { get; set; }
        public virtual TipoAlerta? TipoAlerta { get; set; }
    }
}
