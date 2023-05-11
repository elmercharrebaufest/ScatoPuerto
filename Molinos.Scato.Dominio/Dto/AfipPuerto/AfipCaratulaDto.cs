using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    internal class AfipCaratulaDto
    {
        public string Id { get; set; }
        public string CodigoAduana { get; set; }
        public string CodigoLugarOperativo { get; set; }
        public DateTime FechaArribo { get; set; }
        public DateTime FechaZarpada { get; set; }
        public string Via { get; set; }
        public string NombreMedioTransporte { get; set; }
        public string PuertoDestino { get; set; }
        public string NumeroViaje { get; set; }
        public IList<AfipCaratulaItinerarioDto> Itinerario { get; set; }
    }
}
