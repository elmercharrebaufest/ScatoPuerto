using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ReciboDeBuque : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual Embarque Embarque { get; set; }
        public virtual int NumeroRecibo { get; set; }
        public virtual string Estado { get; set; }
        public virtual string Usuario { get; set; }
        public virtual DateTime? UltimaActualizacion { get; set; }

    }
}