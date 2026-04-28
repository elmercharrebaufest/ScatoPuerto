using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class OtroMuelleCargaDetalleDto
    {
        public int Id { get; set; }
        public DateTime FechaHoraInicio { get; set; }
        public DateTime FechaHoraFin { get; set; }
        public ExportadorDto Exportador { get; set; }
        public DestinoDto Destino { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public string TipoMaterial { get; set; }
        public decimal CantidadTn { get; set; }
    }
}
