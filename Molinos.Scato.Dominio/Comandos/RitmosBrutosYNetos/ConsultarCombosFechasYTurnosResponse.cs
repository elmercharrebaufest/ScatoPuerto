using Molinos.Scato.Dominio.Dto;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Molinos.Scato.Dominio.Comandos.RitmosBrutosYNetos
{
	[DataContract]
	public class ConsultarCombosFechasYTurnosResponse : Resultado
	{
		[DataMember]
		public string FechaMinima { get; set; }

		[DataMember]
		public string FechaMaxima { get; set; }

		[DataMember]
		public List<FechaDto> Fechas { get; set; }
	}

	[DataContract]
	public class FechaDto
	{
		[DataMember]
		public string Fecha { get; set; }

		[DataMember]
		public List<TurnoDto> Turnos { get; set; }
	}

	[DataContract]
	public class TurnoDto
	{
		[DataMember]
		public int Id { get; set; }

		[DataMember]
		public TurnoPuertoDto Turno { get; set; }
	}
}
