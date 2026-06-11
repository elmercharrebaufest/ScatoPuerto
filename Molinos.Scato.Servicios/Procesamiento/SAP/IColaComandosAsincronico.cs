using Molinos.Scato.Dominio.Comandos;

namespace Molinos.Scato.Servicios.Procesamiento.SAP
{
	public interface IColaComandosAsincronico
	{
		void Encolar(Comando comando);
	}
}