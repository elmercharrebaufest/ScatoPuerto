using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionDocumento
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual ConfiguracionDocumento ConfiguracionDocumento { get; set; }
        public virtual Documento Documento { get; set; }
        public virtual NominacionDocumentoEstado NominacionDocumentoEstado { get; set; }
        public virtual ICollection<NominacionDocumentoArchivo> Archivos { get; set; }
        public virtual ICollection<NominacionDocumentoComentario> Comentarios { get; set; }
    }
}
