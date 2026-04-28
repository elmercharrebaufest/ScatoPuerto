namespace Molinos.Scato.Dominio.Dto
{
    public class MuelleDto
    {
        public int Id { get; set; }
        public string Descripcion { get; set; }
        public string SectorResponsableDeCargas { get; set; }
        public string FormaIngresoCarga { get; set; }
        public bool IngresoManual { get; set; }
    }
}
