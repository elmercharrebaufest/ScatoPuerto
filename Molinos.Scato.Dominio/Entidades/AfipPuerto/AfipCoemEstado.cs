using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCoemEstado : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Codigo { get; set; }
        public virtual string Estado { get; set; }
    }
}
