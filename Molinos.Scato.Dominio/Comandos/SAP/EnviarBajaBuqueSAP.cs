using Molinos.Scato.Dominio.Comandos;

namespace Molinos.Scato.Dominio.Comandos.SAP
{
	public class EnviarBajaBuqueSAP : Comando
	{
		public int VaporId { get; set; }
	}
}