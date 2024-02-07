using Molinos.Scato.Dominio.Dto.AfipTablasReferencia;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipSolicitudNoABordoDto
    {
        public int Id { get; set; }
        public string IdentificadorSolicitud { get; set; }
        public string Motivo { get; set; }
        public IList<string> Declaraciones { get; set; }
        public string DescripcionMotivo { get; set; }
        public string Estado { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaActualizacion { get; set; }
    }
}
