using Molinos.Scato.Dominio.Comandos;

namespace Molinos.Scato.Dominio.Comandos.SAP
{
	public class EnviarBuqueSAP : Comando
	{
		public int VaporId { get; set; }
		public string OperacionSap { get; set; } // "A" o "M"
		public bool EstabaEnSap { get; set; }
	}
}