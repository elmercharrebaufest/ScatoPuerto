using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipCaratulaDto
    {
        public virtual int Id { get; set; }
        public virtual string IdentificadorCaratula { get; set; }
        public virtual string IdentificadorBuque { get; set; }
        public virtual string CodigoAduana { get; set; }
        public virtual string CodigoLugarOperativo { get; set; }
        public virtual DateTime FechaArribo { get; set; }
        public virtual DateTime FechaZarpada { get; set; }
        public string Via { get; set; }
        public virtual string NombreMedioTransporte { get; set; }
        public string PuertoDestino { get; set; }
        public string NumeroViaje { get; set; }
        public DateTime FechaRegistro { get; set; }
        public IList<AfipCaratulaItinerarioDto> Itinerario { get; set; }
        public string Estado { get; set; }
        public IList<AfipSolicitudCambioBuqueDto> SolicitudesCambioBuque { get; set; }
        public IList<AfipSolicitudCambioFechasDto> SolicitudesCambioFechas { get; set; }
        public string IdentificadorCierre { get; set; }
    }
}
