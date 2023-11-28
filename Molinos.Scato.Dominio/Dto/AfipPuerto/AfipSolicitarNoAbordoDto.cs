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
        [Required(ErrorMessage = "El IdCaratula es obligatorio.")]
        public int IdCaratula { get; set; }
        [Required(ErrorMessage = "El IdCoem es obligatorio")]
        public int IdCoem { get; set; }        
    }
}
