using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
    [Table("VaporInformacion")]
    public class VaporInformacion : IIdentificable
    {

        [Key]
        public virtual int Id { get; set; }
        public virtual int vapor_id { get; set; }
        public virtual int PaisPuerto_id { get; set; }
        public virtual string nombreBuque { get; set; }
        public virtual string tipoBuque { get; set; }
        public virtual string categoriaBuque { get; set; }
        public virtual string imoVapor { get; set; }
        public virtual decimal freeboard { get; set; }
        public virtual decimal eslora { get; set; }
        public virtual decimal porteNeto { get; set; }
        public virtual decimal porteBruto { get; set; }
        public virtual decimal manga { get; set; }
        public virtual decimal puntual { get; set; }
        public virtual int cantidadBodegasTks { get; set; }

        
    }
}
