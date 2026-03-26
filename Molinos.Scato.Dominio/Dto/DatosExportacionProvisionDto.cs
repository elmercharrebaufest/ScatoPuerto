using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
	public class DatosExportacionProvisionDto
	{
		public List<TarifaBaseCalculoDto> Tarifas { get; set; }
		public string NombreProducto { get; set; }
		public DateTime Periodo { get; set; }
		public decimal CotizacionDolar { get; set; }
	}
}
