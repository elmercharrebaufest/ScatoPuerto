using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class FiltrosAcuerdoDto
    {
        public int Pagina { get; set; }
        public int ItemsPorPagina { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public List<AcuerdoTipoDto> TiposAcuerdo { get; set; }
        public List<VaporDto> Buques { get; set; }
        public List<MuelleDeCargaDto> Muelles { get; set; }
        public List<ExportadorDto> Exportadores { get; set; }
    }
}
