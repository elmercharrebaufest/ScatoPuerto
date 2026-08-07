namespace Molinos.Scato.Dominio.Dto
{
	public class ImprimirEtiquetaPuertoRequest
	{
		public string Username { get; set; }
		public int? IdEtiqueta { get; set; }
		public int ImpresoraId { get; set; }
		public string Impresora { get; set; }
	}
}
