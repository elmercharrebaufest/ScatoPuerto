namespace Molinos.Scato.Dominio.Dto
{
    public class TarifaConceptoDto
    {
        public int Id { get; set; }
        public int AcuerdoDetalleConceptoId { get; set; }
        public decimal ValorTarifa { get; set; }
    }
}
