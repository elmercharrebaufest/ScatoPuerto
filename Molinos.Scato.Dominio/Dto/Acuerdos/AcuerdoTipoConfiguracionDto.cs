using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class AcuerdoTipoConfiguracionDto
    {
        public int Id { get; set; }
        public AcuerdoTipoDto AcuerdoTipo { get; set; }
        public bool EsSanBenito { get; set; }
        public bool EsMOA { get; set; }
        public IList<AcuerdoTipoConfiguracionConceptoDto> AcuerdoTipoConfiguracionConceptos { get; set; }
    }
}
