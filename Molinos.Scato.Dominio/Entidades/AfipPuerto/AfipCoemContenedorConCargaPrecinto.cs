using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCoemContenedorConCargaPrecinto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string IdentificadorPrecinto { get; set; }
    }
}
