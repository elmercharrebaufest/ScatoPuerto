using Molinos.Scato.Dominio.Entidades;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Internal
{
	[NotMapped]
	public class TarifaBaseCalculo
	{
		public LineUp Lineup { get; set; }
		public TarifaPorEmbarque TarifaEmbarque { get; set; }
		public TarifaPorProducto TarifaProducto { get; set; }
		public Exportador Exportador { get; set; }
		public decimal CotizacionDolar { get; set; }
	}
}
