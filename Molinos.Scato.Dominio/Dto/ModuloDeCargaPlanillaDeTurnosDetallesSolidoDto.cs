using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto
    {
        public int Id { get; set; }
        public int BodegaParcel { get; set; }
        public int Linea_Id { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public DestinoDto Destino { get; set; }
        public ExportadorDto Exportador { get; set; }
        
        public decimal Cantidad { get; set; }
    }
}