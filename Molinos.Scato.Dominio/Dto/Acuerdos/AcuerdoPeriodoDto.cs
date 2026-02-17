using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class AcuerdoPeriodoDto
    {
        public int Id { get; set; }
        public int AcuerdoDetalleId { get; set; }
        public DateTime Periodo { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public string UsuarioActualizacion { get; set; }
        public bool Cerrado { get; set; }
        public ICollection<AcuerdoDetalleConceptoPeriodoTarifaDto> AcuerdoDetalleConceptoPeriodoTarifas { get; set; }
    }
}
