using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipSolicitudCierreCarga : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AfipCaratula AfipCaratula { get; set; }
        public virtual string IdentificadorCierre { get; set; }
        public virtual DateTime FechaCreacion { get; set; }
        public virtual DateTime FechaActualizacion { get; set; }
        /// <summary>
        /// 0: Pendiente, 1: Aceptado, 2: Rechazado
        /// </summary>
        public virtual int Estado { get; set; }
    }
}
