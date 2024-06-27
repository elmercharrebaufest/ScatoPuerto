namespace Molinos.Scato.Servicios.Enumeradores
{
	public class EstadosCoemAFIP
	{
		public const string Registrada = "Registrada";
		public const string Presentada = "Presentada";
		public const string Autorizada = "Autorizada";

		public const string Cancelada = "Cancelada";
		public const string Anulada = "Anulada";
	}

	// <ARMOA005-1708 Dylan Lopez>
	public enum EstadosCoemAFIPEnum
	{
		En_Curso = 0,
		Registrada = 1,
		Presentada = 2,
		Autorizada = 3,
		CODE = 4,
		Anulada = 5,
		Rechazada = 6,
	}
	// </ ARMOA005-1708 Dylan Lopez>
}
