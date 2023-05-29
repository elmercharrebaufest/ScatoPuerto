using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCoemContenedorVacio : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AfipCoem AfipCoem { get; set; }
        public virtual string IdentificadorContenedor { get; set; }
        public virtual string CuitATA { get; set; }
        public virtual string Tipo { get; set; }
        public virtual string CodigoPais { get; set; }
    }
}
