namespace Molinos.Scato.Dominio.Dto
{
    public class TarifaPorProductoConceptoDto
    {
        public int Id { get; set; }
        public ConceptoDto Concepto { get; set; }
        public decimal Valor { get; set; }
    }
}