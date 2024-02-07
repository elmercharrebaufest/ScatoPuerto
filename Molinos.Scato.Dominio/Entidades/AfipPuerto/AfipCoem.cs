using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCoem : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AfipCaratula AfipCaratula { get; set; }
        public virtual string IdentificadorCOEM { get; set; }
        public virtual string IdentificadorCaratula { get; set; }
        public virtual ICollection<AfipCoemContenedorConCarga> ContenedoresConCarga { get; set; }
        public virtual ICollection<AfipCoemContenedorVacio> ContenedoresVacios { get; set; }
        public virtual ICollection<AfipCoemMercaderiaSuelta> MercaderiasSueltas { get; set; }
        public virtual ICollection<AfipSolicitudNoABordo> AfipSolicitudesNoABordo { get; set; }
        public virtual AfipCoemEstado AfipCoemEstado { get; set; }
        public virtual DateTime FechaRegistro { get; set; }
    }
}
