using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
	public class AcuerdoPorEmbarcacionDto
	{
		public int IdAcuerdo { get; set; }
		public string Descripcion { get; set; }
		public List<string> Productos { get; set; }
		public decimal CantidadTotal { get; set; }
		public string Muelle { get; set; }
		public string Exportador { get; set; }

		public string RelacionAcuerdo { get; set; } // "Si", "No", "Parcial"
		public decimal CantidadDisponible { get; set; }
		public decimal CantidadAsociada { get; set; }

		public List<EmbarqueAsociadoDto> EmbarquesAsociados { get; set; }
		public int? IdAcuerdoEmbarqueActual { get; set; }

		public AcuerdoPorEmbarcacionDto()
		{
			EmbarquesAsociados = new List<EmbarqueAsociadoDto>();
		}
		public List<AcuerdoDetalleResumenDto> DetallesResumen { get; set; }
	}

	public class EmbarqueAsociadoDto
	{
		public int IdAcuerdoEmbarque { get; set; }
		public string NombreEmbarque { get; set; }
		public int IdEmbarque { get; set; }
		public string Producto { get; set; }
		public decimal Cantidad { get; set; }
	}

	public class AcuerdoDetalleResumenDto
	{
		public string Producto { get; set; }
		public decimal CantidadTotal { get; set; }
		public decimal CantidadDisponible { get; set; }
		public decimal CargaEmbarqueMaterial { get; set; }
	}
}