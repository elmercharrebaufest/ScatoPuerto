using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.Administracion
{
    public class ExcelProvisionGastoDatosDto
    {
        public decimal CotizacionDolar { get; set; }
        public string Producto { get; set; }
        public string Periodo { get; set; }
        public List<ProvisionGastoDatosExcelDto> DatosExcel { get; set; }
    }

    public class ProvisionGastoDatosExcelDto
    {
        public int Embarque_Id { get; set; }
        public string Buque { get; set; }
        public string Muelle { get; set; }
        public string Exportador { get; set; }
        public string Acuerdo { get; set; }
        public decimal Cantidad { get; set; }
        public List<ProvisionGastoConceptosTarifaExcelDto> ConceptosTarifas { get; set; }
    }

    public class ProvisionGastoConceptosTarifaExcelDto
    {
        public ConceptoDto Concepto { get; set; }
        public decimal Valor { get; set; }
    }
}
