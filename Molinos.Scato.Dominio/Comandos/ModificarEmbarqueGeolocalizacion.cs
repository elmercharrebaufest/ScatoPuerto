using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Dominio.Comandos
{
    public class ModificarEmbarqueGeolocalizacion : Comando
    {
        public string NombreBuque { get; set; }
        public string TipoBuque { get; set; }
        public string BanderaBuque { get; set; }
        public EmbarqueInformacionDto DtoInformacion { get; set; }
        public EmbarqueInformacionViajeDto DtoViaje { get; set; }
        public EmbarquePosicionDto DtoPosicion { get; set; }


    }
}