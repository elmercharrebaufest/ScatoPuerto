using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class TipoArchivoPuerto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string TipoArchivo { get; set; }
    }
}