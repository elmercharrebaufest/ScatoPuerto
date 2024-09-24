using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class DocumentoMaterialPuerto
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual Documento Documento { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual bool Activo { get; set; }
    }
}
