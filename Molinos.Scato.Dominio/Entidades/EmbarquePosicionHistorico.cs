using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
    [Table("EmbarquePosicionHistorico")]
    public class EmbarquePosicionHistorico : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int Embarque_id { get; set; }
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
