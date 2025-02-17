namespace Molinos.Scato.Dominio.Dto
{
    public sealed class MotivosFallasBalanzaDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Siglas { get; set; }
        public bool BajaCargaLiquido { get; set; }
        public bool BajaCargaSolido { get; set; }
        public bool CortesLiquido { get; set; }
        public bool CortesSolido { get; set; }
        //public bool Liquido { get; set; }
        //public bool Corte { get; set; }
    }
}