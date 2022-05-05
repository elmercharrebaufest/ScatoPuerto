using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ModuloDeCargaPlanillaDeTurnos : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual DateTime? Fecha { get; set; }
        public virtual ModuloDeCarga ModuloDeCarga { get; set; }
        public virtual TurnoPuerto TurnoPuerto { get; set; }
        public virtual bool Cerrado { get; set; }
        public virtual bool Enviado { get; set; }
        public virtual bool GuardadoPorTablerista { get; set; }
        public virtual bool GuardadoPorRecibidor { get; set; }
        public virtual bool EsLiquido { get; set; }
        public virtual ICollection<ModuloDeCargaPlanillaDeTurnosDetallesLiquido> ModuloDeCargaPlanillaDeTurnosDetallesLiquido { get; set; }
        public virtual ICollection<ModuloDeCargaPlanillaDeTurnosDetallesSolido> ModuloDeCargaPlanillaDeTurnosDetallesSolido { get; set; }
        public virtual ICollection<ModuloDeCargaPlanillaDeTurnosCortes> ModuloDeCargaPlanillaDeTurnosCortes { get; set; }
        public virtual ICollection<ModuloDeCargaPlanillaDeTurnosObservacionesDeCalidad> ModuloDeCargaPlanillaDeTurnosObservacionesDeCalidad { get; set; }
    }
}