
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
    [Table("PuntosInteresGeolocalizacion")]
    public class PuntosInteresGeolocalizacion : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Nombre { get; set; }
        public virtual string TipoUbicacion { get; set; }
        public virtual string Imagen { get; set; }
        public virtual string Puerto { get; set; }
        public virtual string Pais { get; set; }
        public virtual decimal HorasSanBenito { get; set; }
        public virtual string Latitud { get; set; }
        public virtual string Longitud { get; set; }
        public virtual decimal DistanciaKM { get; set; }
        public virtual decimal RadioPunto { get; set; }
        public virtual string TipoZona { get; set; }
        public virtual string AgrupadorZona { get; set; }
        public virtual short PosicionZona { get; set; }
        public virtual short Estado { get; set; }
        public virtual DateTime FechaRegistro { get; set; }
    }
}



