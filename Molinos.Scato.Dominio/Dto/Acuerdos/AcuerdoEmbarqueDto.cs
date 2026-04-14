namespace Molinos.Scato.Dominio.Dto
{
    public class AcuerdoEmbarqueDto
    {
        public int Id { get; set; }
        public EmbarqueDto Embarque { get; set; }
        public decimal Cantidad { get; set; }
    }
}