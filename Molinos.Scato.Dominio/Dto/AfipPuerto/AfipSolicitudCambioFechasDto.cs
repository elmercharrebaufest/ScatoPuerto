using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipSolicitudCambioFechasDto
    {
        public int Id { get; set; }
        public DateTime FechaArribo { get; set; }
        public DateTime FechaZarpada { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaActualizacion { get; set; }
        public string Estado { get; set; }
    }
}
