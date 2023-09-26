using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.AfipPuerto
{
    public class AfipSolicitarCierreCargaGranelDto
    {        
        [Required(ErrorMessage = "El identificador ")]
        public int IdCaratula { get; set; } 
        public IList<int> Coems { get; set; }
    }
}
