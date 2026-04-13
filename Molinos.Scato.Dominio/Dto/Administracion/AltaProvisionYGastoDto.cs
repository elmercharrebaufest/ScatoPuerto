using System.Collections.Generic;

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

		public decimal TotalIngresosARS { get; set; }
		public decimal TotalIngresosUSD { get; set; }
		public decimal TotalEgresosARS { get; set; }
		public decimal TotalEgresosUSD { get; set; }
		public decimal GranTotalIngresosUSD { get; set; }
		public decimal GranTotalEgresosUSD { get; set; }

		public List<TarifaBaseCalculoDto> TarifasAplicables { get; set; }
		public decimal CotizacionDolar { get; set; }
		public List<DesglosePorBuqueDto> DesglosesPorBuque { get; set; } = new List<DesglosePorBuqueDto>();
	}

	public class DesglosePorBuqueDto
	{
		public string Buque { get; set; }
		public decimal Tn { get; set; }
		public List<string> Acuerdos { get; set; } = new List<string>();
		public decimal IngresosARS { get; set; }
		public decimal IngresosUSD { get; set; }
		public decimal EgresosARS { get; set; }
		public decimal EgresosUSD { get; set; }
		public List<ItemProvisionDto> ItemsProvision { get; set; } = new List<ItemProvisionDto>();
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
		public List<string> Acuerdos { get; set; } = new List<string>();
		public decimal Tn { get; set; }
		public Dictionary<string, decimal> TnPorBuque { get; set; } = new Dictionary<string, decimal>();
		public Dictionary<string, List<string>> AcuerdosPorBuque { get; set; } = new Dictionary<string, List<string>>();
	}
}