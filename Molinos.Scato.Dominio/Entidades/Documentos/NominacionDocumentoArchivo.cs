using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionDocumentoArchivo
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Usuario { get; set; }
        public virtual string Ubicacion { get; set; }
        public virtual DateTime FechaSubida { get; set; }
    }
}
 