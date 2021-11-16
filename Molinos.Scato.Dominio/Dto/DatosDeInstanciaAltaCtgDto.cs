namespace Molinos.Scato.Dominio.Dto
{
    public sealed class DatosDeInstanciaAltaCTGDto
    {
        public int WorkflowDefinicionId { get; set; }
        public string WorkflowCodigo { get; set; }
        public bool SolicitaConfirmarCTG { get; set; }
    }
}