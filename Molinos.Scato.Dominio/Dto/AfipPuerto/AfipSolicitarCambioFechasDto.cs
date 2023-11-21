using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipSolicitarCambioFechasDto
    {
        [Required(ErrorMessage = "El identificador de carátula es obligatorio")]
        public int CaratulaId { get; set; }

        [Required(ErrorMessage = "La fecha de arribo es obligatoria")]
        public DateTime FechaArribo { get; set; }

        [Required(ErrorMessage = "La fecha de zarpada es obligatoria")]
        [FechaFinMayorQueFechaInicio("FechaArribo")]
        [FechaValida(ErrorMessage = "La fehca de zarpada debe ser en el futuro")]
        public DateTime FechaZarpada { get; set; }

        [Required(ErrorMessage = "El motivo es obligatorio")]
        public string CodigoMotivo { get; set; }
        public string DescripcionMotivo { get; set; }
    }
}
