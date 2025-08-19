using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Dominio.Dto
{
    public class ConceptoDto
    {
        public int Id { get; set; }
        public string Descripcion { get; set; }
        public TipoConceptoDto TipoConcepto { get; set; }
        public MonedaDto Moneda { get; set; }
        public TipoTarifaDto TipoTarifa { get; set; }
        public bool PresentaAjuste { get; set; }
        public bool PorProducto { get; set; }
        public bool PorEmbarque { get; set; }
    }
}