using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto.Administracion
{
	public class AdministracionEmbarqueDto
	{
		public int Id { get; set; }
		public int EmbarqueId { get; set; }
		public EstadoEmbarqueDto EstadoEmbarque { get; set; }
		public decimal NetoTonnage { get; set; }
		public DateTime? AmarroMuelleProp { get; set; }
		public DateTime? DesamarroMuelleProp { get; set; }
		public string MuelleProp { get; set; }
		public ICollection<AdministracionEmbarqueAgenciaDto> Agencias { get; set; }
		public ICollection<AdministracionEmbarqueExportadorDto> Exportadores { get; set; }
		public DateTime? FechaFacturado { get; set; }
		public DateTime? FechaAplicado { get; set; }
	}
}