using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AcuerdoPeriodo : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual DateTime Periodo { get; set; }
        public virtual DateTime? FechaActualizacion { get; set; }
        public virtual string UsuarioActualizacion { get; set; }
        public virtual ICollection<AcuerdoDetalleConceptoPeriodoTarifa> AcuerdoDetalleConceptoPeriodoTarifas { get; set; }
        public virtual bool Cerrado { get; set; }
    }
}
