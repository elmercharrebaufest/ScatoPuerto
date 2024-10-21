using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class DocumentoTipo
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Nombre { get; set; }
    }
}
