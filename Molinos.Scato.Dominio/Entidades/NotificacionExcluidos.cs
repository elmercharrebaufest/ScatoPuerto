using System;
using System.ComponentModel.DataAnnotations;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Enums;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NotificacionExcluidos: IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Username { get; set; }
        public NotificacionProgramaDeEmbarque NotificacionProgramaDeEmbarque { get; set; }
    }
}
