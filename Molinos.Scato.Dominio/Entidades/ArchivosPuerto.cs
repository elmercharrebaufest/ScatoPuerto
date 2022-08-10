using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace Molinos.Scato.Dominio.Entidades
{
    public class ArchivosPuerto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual Embarque Embarque { get; set; }
        public virtual int Usuario_Id { get; set; }
        public virtual string NombreArchivo { get; set; }
        public virtual string Archivo { get; set; }
        public virtual TipoArchivoPuerto TipoArchivoPuerto { get; set; }
        public virtual DateTime Fecha { get; set; }

    }
}