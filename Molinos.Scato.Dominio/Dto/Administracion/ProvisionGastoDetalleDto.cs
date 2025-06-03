namespace Molinos.Scato.Dominio.Dto.Administracion
{
    public class ProvisionGastoDetalleDto
    {
        public int Id { get; set; }
        public TarifaPorEmbarqueConceptoDto TarifaPorEmbarqueConcepto { get; set; }
        public ProvisionGastoDto ProvisionGasto { get; set; }
        public decimal ValorCalculado { get; set; }
        public decimal ValorAjustado { get; set; }
    }
}