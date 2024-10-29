using System;

namespace Molinos.Scato.Dominio.Comandos.RitmosBrutosYNetos
{
	public class ConsultarRitmosBrutosRequest : Comando
	{
		public Int32 IdModuloDeCarga { get; set; }
		public DateTime Fecha { get; set; }
		//public Int32 IdTurnoPuerto { get; set; }
	}
}
