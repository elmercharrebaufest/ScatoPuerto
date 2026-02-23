using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class OtroMuelleCargaDto
    {
        public int Id { get; set; }
        public string Observacion { get; set; }
        public bool FumigacionPreventiva { get; set; }
        public bool FumigacionCurativa { get; set; }
        public bool Senasa { get; set; }
        public IList<OtroMuelleCargaDetalleDto> OtroMuelleCargaDetalles { get; set; }
    }
}
