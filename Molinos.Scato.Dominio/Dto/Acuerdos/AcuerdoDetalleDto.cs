using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class AcuerdoDetalleDto
    {
        public int Id { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public decimal Cantidad { get; set; }
        public ICollection<AcuerdoDetalleConceptoDto> AcuerdoDetalleConceptos { get; set; }
    }
}
