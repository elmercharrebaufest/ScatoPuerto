namespace Molinos.Scato.Dominio.Dto
{
    public class AcuerdoTipoConfiguracionConceptoDto
    {
        public int Id { get; set; }
        public ConceptoDto Concepto { get; set; }
        public bool Obligatorio { get; set; }
    }
}
