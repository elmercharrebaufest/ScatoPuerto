using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipSolicitarCierreCargaGranelDto
    {
        [Required(ErrorMessage = "El IdCaratula es obligatorio.")]
        public int IdCaratula { get; set; }

        [Required(ErrorMessage = "La/s Coem/s son obligatorias ")]
        public IList<AfipSolicitarCierreCargaGranelCoemDto> Coems { get; set; }

        [Required(ErrorMessage = "La fecha de zarpada es obligatoria")]
        public DateTime FechaZarpada { get; set; }

        public bool IgnorarFechaZarpada { get; set; }

        [Required(ErrorMessage = "El numero de viaje es obligatorio")]
        public string NumeroViaje { get; set; }

        public string IdentificadorCaratula { get; set; }
    }

    public class AfipSolicitarCierreCargaGranelCoemDto
    {
        public int IdCoem { get; set; }
        public string IdentificadorCoem { get; set; }
        public IList<AfipSolicitarCierreCargaGranelCoemDeclaracionDto> Declaraciones { get; set; }
    }

    public class AfipSolicitarCierreCargaGranelCoemDeclaracionDto
    {
        public string IdentificadorDeclaracion { get; set; }
        public DateTime FechaEmbarque { get; set; }
        public int CantidadReal { get; set; }
    }
}
