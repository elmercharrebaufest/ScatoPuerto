using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Dominio.Dto.Administracion
{
    public class TarifaPorEmbarqueConceptoDto
    {
        public int Id { get; set; }
        public TarifaPorEmbarqueDto TarifaPorEmbarque { get; set; }
        public ConceptoDto Concepto { get; set; }
    }
}