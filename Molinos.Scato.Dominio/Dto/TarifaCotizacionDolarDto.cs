using System;

namespace Molinos.Scato.Dominio.Dto
{
	public class TarifaCotizacionDolarDto
	{
		public int Id { get; set; }
		public DateTime Periodo { get; set; }
		public decimal ValorDolar { get; set; }
		public DateTime FechaActualizacion { get; set; }
	}
}