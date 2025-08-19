using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class FumigacionBodegaDto
    {
        public IList<PlanoDeCargaBodegaDto> Bodegas { get; set; }
        public bool TieneFumigacionPreventiva { get; set; }
        public bool TieneFumigacionCurativa { get; set; }
    }
}