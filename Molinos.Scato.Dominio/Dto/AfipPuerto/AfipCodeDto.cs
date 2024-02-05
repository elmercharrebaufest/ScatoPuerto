using Molinos.Scato.Dominio.Dto.AfipPuerto;
using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipCodeDto
    {
        public int Id { get; set; }
        public string IdentificadorCaratula { get; set; }
        public string NumeroViaje { get; set; }
        public ICollection<AfipCodeCoemDto> IdentificadoresCOEM { get; set; }
    }
}
