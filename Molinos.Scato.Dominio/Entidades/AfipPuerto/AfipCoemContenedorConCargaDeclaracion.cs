using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCoemContenedorConCargaDeclaracion : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string IdentificadorDeclaracion { get; set; }
    }
}
