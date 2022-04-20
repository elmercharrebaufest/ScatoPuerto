using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class PuntosInteresGeolocalizacionDto
    {
        public string Nombre { get; set; }
        public string TipoUbicacion { get; set; }
        public string Imagen { get; set; }
        public string Puerto { get; set; }
        public string Pais { get; set; }
        public double HorasSanBenito { get; set; }
        public string Latitud { get; set; }
        public string Longitud { get; set; }
        public decimal DistanciaKM { get; set; }
        public decimal RadioPunto { get; set; }
        public string TipoZona { get; set; }
        public string AgrupadorZona { get; set; }
        public short PosicionZona { get; set; }
        public short Estado { get; set; }
        public DateTime FechaRegistro { get; set; }

    }
}

