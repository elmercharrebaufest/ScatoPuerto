using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Molinos.Scato.Dominio.Entidades
{
    [Table("EmbarqueInformacionViaje")]
    public class EmbarqueInformacionViaje : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        //  [Required]
        public virtual Embarque Embarque { get; set; }
        public virtual string PaisOrigen { get; set; }
        public virtual string PuertoOrigen { get; set; }
        public virtual string PaisDestino { get; set; }
        public virtual string PuertoDestino { get; set; }
        public virtual string ATD { get; set; }
        public virtual string ATA { get; set; }
        public virtual string ETA_Reportado { get; set; }
        public virtual string Destino_Reportado { get; set; }
        public virtual string Peso_Reportado { get; set; }
        public virtual int VelocidadRecorrido { get; set; }
        public virtual DateTime FechaRegistro { get; set; }
    }
}