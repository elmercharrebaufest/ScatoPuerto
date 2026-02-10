using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Dominio.Comandos
{
	public class GuardarTarifaDolar : Comando
	{
		public TarifaCotizacionDolarDto Dto { get; set; }
	}
}
