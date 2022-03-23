using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ObservacionesDeCalidad : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual DateTime Fecha { get; set; }
        public virtual DateTime Hora { get; set; }
        public virtual string Observaciones { get; set; }
        public virtual ModuloDeCargaPlanillaDeTurnosTurnos ModuloDeCargaPlanillaDeTurnosTurnos { get; set; }
        public virtual bool ObservacionVisible { get; set; }

    }
}