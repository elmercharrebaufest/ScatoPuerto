namespace Molinos.Scato.Dominio.Dto
{
	public class AcuerdoDetalleConceptoPeriodoTarifaDto
	{
		public int Id { get; set; }
		public int AcuerdoDetalleConceptoId { get; set; }
		public int ConceptoId { get; set; }
		public int AcuerdoPeriodoId { get; set; }
		public decimal ValorTarifa { get; set; }
	}
}