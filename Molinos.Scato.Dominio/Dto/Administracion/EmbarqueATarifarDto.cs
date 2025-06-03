using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.Administracion
{
    public class EmbarqueATarifarDto
    {
        public EmbarqueDto Embarque { get; set; }
        public VaporDto Vapor { get; set; }
        public IList<CargaPorProductoExportadorDto> Cargas { get; set; }
        public bool EsLiq { get; set; }
    }

    public class CargaPorProductoExportadorDto
    {
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public ExportadorDto Exportador {get;set;}
        public decimal Cantidad { get; set; }
    }
}
