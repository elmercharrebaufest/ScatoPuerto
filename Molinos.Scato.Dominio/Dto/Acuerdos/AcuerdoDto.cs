using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
	public class AcuerdoDto
	{
		public int Id { get; set; }
		public AcuerdoTipoDto AcuerdoTipo { get; set; }
		public string Descripcion { get; set; }
		public MuelleDeCargaDto MuelleDeCarga { get; set; }
		public ExportadorDto Exportador { get; set; }
		public DateTime FechaInicio { get; set; }
		public DateTime FechaFin { get; set; }
		public DateTime? FechaEliminacion { get; set; }
		public string UsuarioEliminacion { get; set; }
		public string NombreArchivo { get; set; }
		public string UbicacionArchivo { get; set; }

		public string Estado { get; set; }

		public ICollection<AcuerdoDetalleDto> AcuerdoDetalles { get; set; }

		public ICollection<AcuerdoEmbarqueDto> AcuerdoEmbarques { get; set; }
	}
}