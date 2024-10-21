using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionDocumentoComentario
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Usuario { get; set; }
        public virtual string Comentario { get; set; }
        public virtual DateTime Fecha { get; set; }
    }
}
