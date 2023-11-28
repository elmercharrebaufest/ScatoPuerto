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
        public int Id { get; set; }

        //[Required(ErrorMessage = "El Identificador Caratula es obligatorio.")]
        public string IdentificadorCaratula { get; set; }
        
        [Required(ErrorMessage = "El Identificador Buque es obligatorio.")]
        public string IdentificadorBuque { get; set; }
        //[Required(ErrorMessage = "El codigo aduana es obligatorio.")]
        public string CodigoAduana { get; set; }
        
        //[Required(ErrorMessage = "El lugar operativo es obligatorio.")]
        public string CodigoLugarOperativo { get; set; }
        
        [Required(ErrorMessage = "La Fecha Arribo es obligatorio.")]
        public DateTime FechaArribo { get; set; }

        [Required(ErrorMessage = "La fecha de Zarpada es obligatorio.")]
        [FechaFinMayorQueFechaInicio("FechaArribo")]
        [FechaValida(ErrorMessage = "La fecha de zarpada debe ser en el futuro.")]
        public DateTime FechaZarpada { get; set; }
        public string Via { get; set; }
        public string NombreMedioTransporte { get; set; }
        public string PuertoDestino { get; set; }
        public string NumeroViaje { get; set; }
        public DateTime FechaRegistro { get; set; }
        public IList<AfipCaratulaItinerarioDto> Itinerario { get; set; }
        public string Estado { get; set; }
        public IList<AfipSolicitudCambioBuqueDto> SolicitudesCambioBuque { get; set; }
        public IList<AfipSolicitudCambioFechasDto> SolicitudesCambioFechas { get; set; }
    }
}
