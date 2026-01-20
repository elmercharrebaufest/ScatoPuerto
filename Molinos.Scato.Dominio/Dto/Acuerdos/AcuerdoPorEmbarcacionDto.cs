using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto.Acuerdos
{
	public class AcuerdoPorEmbarcacionDto
	{
		public int IdAcuerdo { get; set; }
		public string Descripcion { get; set; }
		public string Producto { get; set; }
		public decimal CantidadTotal { get; set; }
		public string Muelle { get; set; }
		public string Exportadores { get; set; }
		public string EstadoAsociacion { get; set; }
		public decimal CantidadDisponible { get; set; }
		public List<string> EmbarquesAsociados { get; set; }
		public bool ProductoRelacionadoTotalmente { get; set; }

		public AcuerdoPorEmbarcacionDto()
		{
			EmbarquesAsociados = new List<string>();
		}
	}
}
