using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual ModuloDeCargaPlanillaDeTurnos ModuloDeCargaPlanillaDeTurnos { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual int TotalTurnoMaterial { get; set; }
        public virtual int KgGravedad { get; set; }
    }
}
