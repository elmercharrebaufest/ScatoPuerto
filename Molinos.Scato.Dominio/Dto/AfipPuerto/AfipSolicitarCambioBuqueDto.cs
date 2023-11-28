using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipSolicitarCambioBuqueDto
    {
        [Required(ErrorMessage = "El identificador de carátula es obligatorio")]
        public int CaratulaId { get; set; }

        [RegularExpression(@"^$|^\d{7}$", ErrorMessage = "El IMO debe constar exactamente de 7 numeros")]
        [Required(AllowEmptyStrings = true)]
        public string IdentificadorBuque { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "El nombre del buque es obligatorio")]
        [DisplayFormat(ConvertEmptyStringToNull = false)]
        public string NombreMedioTransporte { get; set; }
    }
}
