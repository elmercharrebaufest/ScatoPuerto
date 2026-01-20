namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto
    {
        public int Id { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public DestinoDto Destino { get; set; }
        public BodegaDto Bodega { get; set; }
        public ExportadorDto Exportador { get; set; }

        public int Cantidad { get; set; }
        public int idBalanzaCorte { get; set; }

        //   public virtual DateTime? FechaCarga { get; set; }
        public BalanzaPuertoDto BalanzaPuerto { get; set; }
        public SiloCeldaDto SiloCelda { get; set; }
        public int? Fila { get; set; }
        public virtual string HoraInicio { get; set; }
        public virtual string HoraFin { get; set; }
        public bool CambioMaterial { get; set; }
        public string Observaciones { get; set; }
    }
}