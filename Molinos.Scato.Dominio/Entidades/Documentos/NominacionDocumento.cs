using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionDocumento
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual Documento Documento { get; set; }
        public virtual Cliente Cliente { get; set; }
        public virtual Destino Destino { get; set; }
        public virtual NominacionDocumentoEstado Estado { get; set; }
        public virtual ICollection<NominacionDocumentoArchivo> Archivos { get; set; }
        public virtual ICollection<NominacionDocumentoComentario> Comentarios { get; set; }
        public virtual int CantidadDeJuegos { get; set; }
    }
}
