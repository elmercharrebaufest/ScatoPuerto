using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipSolicitudCambioBuqueDto
    {
        public int Id { get; set; }
        public string IdentificadorBuque { get; set; }
        public string NombreMedioTransporte { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaActualizacion { get; set; }
        public string Estado { get; set; }
    }
}
