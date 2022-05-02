using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ModuloDeCargaPlanillaDeTurnosObservacionesDeCalidad : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual DateTime Fecha { get; set; }
        public virtual DateTime Hora { get; set; }
        public virtual DateTime FechaHora { get; set; }
        public virtual string Observaciones { get; set; }
        public virtual ModuloDeCargaPlanillaDeTurnos ModuloDeCargaPlanillaDeTurnos { get; set; }
        public virtual bool ObservacionVisible { get; set; }

    }
}