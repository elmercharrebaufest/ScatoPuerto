using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class DocumentoDestino
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual Documento Documento { get; set; }
        public virtual Destino Destino { get; set; }
    }
}
