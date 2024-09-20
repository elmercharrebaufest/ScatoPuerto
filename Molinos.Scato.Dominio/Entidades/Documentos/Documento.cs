using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class Documento
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual DocumentoTipo DocumentoTipo { get; set; }
        public virtual string Nombre { get; set; }
        public virtual bool Activo { get; set; }
    }
}
