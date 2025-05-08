using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class TarifaPorEmbarque : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual Embarque Embarque { get; set; }
        public virtual Exportador Exportador { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual DateTime Periodo { get; set; }
    }
}