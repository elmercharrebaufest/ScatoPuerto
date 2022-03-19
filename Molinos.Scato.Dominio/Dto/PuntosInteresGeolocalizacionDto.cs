using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class PuntosInteresGeolocalizacionDto
    {
        public int Id { get; set; }

        public string Nombre { get; set; }
        public string Altitud   { get; set; }
        public string  Longitud { get; set; }
        public DateTime FechaRegistro { get; set; }

    }
}

