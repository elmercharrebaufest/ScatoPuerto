using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
    [Table("ErroresGeolocalizacion")]
    public class ErroresGeolocalizacion : IIdentificable
    {

        [Key, Column(Order = 0)]
        public virtual int Id { get; set; }
        //   [Required]
        public virtual int Embarque_id { get; set; }
        public virtual string NombreBuque { get; set; }
        public virtual string TipoBuque { get; set; }
        public virtual string Bandera { get; set; }
        public virtual string IMO { get; set; }
        public virtual string Mensaje { get; set; }
        public virtual DateTime FechaError { get; set; }

    }
}
