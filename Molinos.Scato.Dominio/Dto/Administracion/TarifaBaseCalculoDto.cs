using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto.Administracion
{
	public class TarifaBaseCalculoDto
	{
		public LineUpDto Lineup { get; set; }
		public TarifaPorProductoDto TarifaProducto { get; set; }
		public TarifaPorEmbarqueDto TarifaEmbarque { get; set; }
		public ExportadorDto Exportador { get; set; }
		public decimal CotizacionDolar { get; set; }
		public AcuerdoEmbarqueDto AcuerdoEmbarque { get; set; }
		public List<AcuerdoDetalleConceptoPeriodoTarifaDto> TarifasAcuerdo { get; set; }
	}
}