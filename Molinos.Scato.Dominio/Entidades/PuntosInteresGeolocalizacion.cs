
using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class PuntosInteresGeolocalizacion : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }                
        public virtual string Nombre { get; set; }
        public virtual string Altitud { get; set; }
        public virtual string Longitud { get; set; }
        public virtual DateTime FechaRegistro { get; set; }
    }
}



