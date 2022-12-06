using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class NominacionDatoTecnicoExportadorDto
    {
        public int Id { get; set; }
        public NominacionDatoTecnicoDto NominacionDatoTecnico { get; set; }
        public ExportadorDto Exportador { get; set; }
        public int Cantidad { get; set; }
    }
}
