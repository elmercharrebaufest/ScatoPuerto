namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaPlanillaDeTurnosCortesDto
    {
        public int Id { get; set; }
        public MotivosFallasBalanzaDto MotivosDeCorte { get; set; }
        public string HoraInicio { get; set; }
        public string HoraFin { get; set; }
        public string TiempoTotal { get; set; }
        public string Observaciones { get; set; }
        public int? idBalanzaCorte { get; set; }
        public int? Cantidad { get; set; }
        public TipoLineaEmbarqueDto TipoLineaEmbarque { get; set; }
        public bool Recordatorio { get; set; }
        public int? BodegaParcel {  get; set; }
        public string Tk { get; set; }
    }
}