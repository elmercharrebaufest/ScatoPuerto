using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipRegistrarCaratulaDto : AfipCaratulaDto
    {
        [Required(ErrorMessage = "El IMO es obligatorio.")]
        [StringLength(7, MinimumLength = 7, ErrorMessage = "El IMO ingresado no es válido")]
        public override string IdentificadorBuque { get; set; }

        [StringLength(3, MinimumLength = 3, ErrorMessage = "La aduana indicada no es válida")]
        [Required(ErrorMessage = "La aduana es obligatoria.")]
        public override string CodigoAduana { get; set; }

        [StringLength(5, MinimumLength = 5, ErrorMessage = "El lugar operativo indicado no es válido")]
        [Required(ErrorMessage = "El lugar operativo es obligatorio.")]
        public override string CodigoLugarOperativo { get; set; }

        [Required(ErrorMessage = "La Fecha Arribo es obligatorio.")]
        [RangoValidoFechaArribo]
        public override DateTime FechaArribo { get; set; }

        [Required(ErrorMessage = "La fecha de Zarpada es obligatorio.")]
        [FechaFinMayorQueFechaInicio("FechaArribo")]
        [FechaValida(ErrorMessage = "La fecha de zarpada debe ser en el futuro.")]
        public override DateTime FechaZarpada { get; set; }

        [Required(ErrorMessage = "El nombre del buque es obligatorio")]
        public override string NombreMedioTransporte { get; set; }
    }
}
