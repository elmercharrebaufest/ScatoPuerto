using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.AfipPuerto
{
    public class AfipSolicitarNoAbordoDto
    {
        [Required(ErrorMessage = "El IdCoem es obligatorio")]
        public int IdCoem { get; set; }
        [Required(ErrorMessage = "El Codigo de motivo es obligatorio")]
        public string CodigoMotivo { get; set; }
        public string DescripcionMotivo { get; set; }
        public IList<string> Declaraciones { get; set; }
    }
}
