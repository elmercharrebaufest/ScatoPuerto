using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
    [Table("EmbarqueInformacion")]
    public class EmbarqueInformacion : IIdentificable
    {
  
        [Key, Column(Order = 0)]
        public virtual int Id { get; set; }
        //   [Required]
        public virtual Embarque Embarque { get; set; }
        public virtual  string IMO { get; set; }
        public virtual  string MMSI { get; set; }
        public virtual Bandera Bandera { get; set; }
        public virtual  int Tonelaje { get; set; }
        public virtual  int TonelajePesoMuerto { get; set; }
        public virtual  string LargoxAnchoExtremo { get; set; }
        public virtual  string FotoEmbarque { get; set; }
        public virtual DateTime FechaRegistro { get; set; }


    }
}
