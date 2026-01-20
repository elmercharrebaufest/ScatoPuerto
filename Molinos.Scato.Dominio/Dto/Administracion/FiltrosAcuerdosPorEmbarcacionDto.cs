using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto.Administracion
{
	public class FiltrosAcuerdosPorEmbarcacionDto
	{
		public int Pagina { get; set; }
		public int ItemsPorPagina { get; set; }
		public DateTime Periodo { get; set; }
		public MuelleDeCargaDto Muelle { get; set; }
		public ExportadorDto Exportador { get; set; }
		public MaterialPuertoDto Material { get; set; }
	}
}
