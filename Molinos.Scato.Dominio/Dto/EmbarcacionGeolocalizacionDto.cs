using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class EmbarcacionGeolocalizacionDto
    {
        public int Embarque_Id { get; set; }
        public int Vapor_Id { get; set; }
        public string NombreBuque { get; set; }
        public string UbicacionLineUp { get; set; }
        public bool Vicentin { get; set; }
        public bool OtrosMuelles { get; set; }
        public bool Noryon { get; set; }
        public bool SanBenito { get; set; }
        public EmbarqueInformacionDto Informacion { get; set; }
        public EmbarqueInformacionViajeDto Viaje { get; set; }
        public EmbarquePosicionDto Posicion { get; set; }
    }
}
