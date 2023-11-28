using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipSolicitudCambioBuque : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AfipCaratula AfipCaratula { get; set; }
        public virtual string IdentificadorBuque { get; set; }
        public virtual string NombreMedioTransporte { get; set; }
        public virtual DateTime FechaCreacion { get; set; }
        public virtual DateTime FechaActualizacion { get; set; }
        /// <summary>
        /// 0: Pendiente, 1: Aceptado, 2: Rechazado
        /// </summary>
        public virtual int Estado { get; set; }
    }
}
