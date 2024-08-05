using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Molinos.Scato.Dominio.Comandos.RitmosBrutosYNetos
{
	[DataContract]
	public class ConsultarBalanzasCortesResponse : Resultado
	{
		[DataMember]
		public List<BalanzaCorteFilledDto> BalanzasCortes { get; set; }
	}

	[DataContract]
	public class BalanzaCorteFilledDto
	{
		[DataMember]
		public int Id { get; set; }

		[DataMember]
		public int IdTurnoPuerto { get; set; }

		[DataMember]
		public string NombreTurnoPuerto { get; set; }

		[DataMember]
		public string FechaInicio { get; set; }

		[DataMember]
		public string FechaCorte { get; set; }

		[DataMember]
		public int IdBalanza { get; set; }

		[DataMember]
		public string NumeroBalanza { get; set; }

		[DataMember]
		public bool CorteManual { get; set; }

		[DataMember]
		public int Cantidad { get; set; }
	}
}
