using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.Administracion
{
    public class AltaProvisionYGastoDto
    {
        public int ProvisionId { get; set; }
        public bool Confirmado { get; set; }
        public TarifaPorEmbarqueDto TarifaPorEmbarque { get; set; }
        public List<ItemProvisionDto> ItemsProvision { get; set; }
        public List<int> IdsTarifas { get; set; }
        public InfoFiltrada InfoFiltrada { get; set; }
    }

    public class ItemProvisionDto
    {
        public ConceptoDto Concepto { get; set; }
        public decimal Valor { get; set; }
    }

    public class InfoFiltrada
    {
        public List<string> Buques { get; set; } = new List<string>();
        public List<string> Materiales { get; set; } = new List<string>();
        public decimal Tn { get; set; }
    }
}
