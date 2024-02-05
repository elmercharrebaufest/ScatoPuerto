using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCoemContenedorConCarga : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AfipCoem AfipCoem { get; set; }
        public virtual string IdentificadorContenedor { get; set; }
        public virtual string CuitATA { get; set; }
        public virtual string Tipo { get; set; }
        public virtual decimal Peso { get; set; }
        public virtual ICollection<AfipCoemContenedorConCargaPrecinto> Precintos { get; set; }
        public virtual ICollection<AfipCoemContenedorConCargaDeclaracion> Declaraciones { get; set; }
    }
}
