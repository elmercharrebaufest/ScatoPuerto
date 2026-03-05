using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class OtroMuelleNominacionDto
    {
        public bool TieneFumigacion { get; set; }
        public bool TieneSenasa { get; set; }
        public IList<MaterialPuertoDto> Materiales { get; set; }
        public IList<DestinoDto> Destinos { get; set; }
        public IList<ExportadorDto> Exportadores { get; set; }
    }
}
