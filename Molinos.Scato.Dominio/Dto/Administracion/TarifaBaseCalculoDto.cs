using Molinos.Scato.Dominio.Dto;
using System.Collections.Generic;

public class TarifaBaseCalculoDto
{
	public LineUpDto Lineup { get; set; }
	public EmbarqueDto Embarque { get; set; }
	public TarifaPorProductoDto TarifaProducto { get; set; }
	public TarifaPorEmbarqueDto TarifaEmbarque { get; set; }
	public ExportadorDto Exportador { get; set; }
	public decimal CotizacionDolar { get; set; }
	public AcuerdoEmbarqueDto AcuerdoEmbarque { get; set; }
	public List<AcuerdoDetalleConceptoPeriodoTarifaDto> TarifasAcuerdo { get; set; }
}