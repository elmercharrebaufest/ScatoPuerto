using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Molinos.Scato.Dominio.Comandos.RitmosBrutosYNetos
{
	[DataContract]
	public class ConsultarRitmosBrutosResponse : Resultado
	{
		[DataMember]
		public List<RitmoBrutoDto> RitmosBrutos { get; set; }
	}

	[DataContract]
	public class RitmoBrutoDto
	{
		[DataMember]
		public int Id { get; set; }

		[DataMember]
		public int IdTurnoPuerto { get; set; }

		[DataMember]
		public string Nombre { get; set; }

		[DataMember]
		public string Fecha { get; set; }

		[DataMember]
		public int IdBalanza { get; set; }

		[DataMember]
		public string CodigoBalanza { get; set; }

		[DataMember]
		public int Cantidad { get; set; }
	}
}
