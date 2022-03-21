using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
    [Table("EmbarquePosicion")]
    public class EmbarquePosicion : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        //[Required]
        public virtual Embarque Embarque { get; set; }
        public virtual DateTime HoraUTCPosicionRecibida { get; set; }
        public virtual DateTime HoraLocalBarco { get; set; }
        public virtual string Area { get; set; }
        public virtual string PuertoActual { get; set; }
        public virtual string Latitud { get; set; }
        public virtual string Longitud { get; set; }
        public virtual string Estado { get; set; }
        public virtual string VelocidadCurso { get; set; }
        public virtual DateTime FechaRegistro { get; set; }
    }
}

