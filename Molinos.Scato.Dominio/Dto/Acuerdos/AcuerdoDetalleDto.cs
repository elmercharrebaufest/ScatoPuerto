using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class AcuerdoDetalleDto
    {
        public int Id { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public decimal Cantidad { get; set; }
        public ICollection<AcuerdoDetalleConceptoDto> AcuerdoDetalleConceptos { get; set; }
        // public ICollection<AcuerdoEmbarqueDto> AcuerdoEmbarques { get; set; }
        public bool RelacionEmbarque { get; set; }
        public string Buques { get; set; }
    }
}
