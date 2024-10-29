using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.RitmosBrutosYNetos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento.RitmosBrutosYNetos
{
	public class ProcesadorConsultarCombosFechasYTurnos : ProcesadorComando<ConsultarCombosFechasYTurnosRequest>
	{
		private readonly IServicioRepositorio _servicioRepositorio;

		public ProcesadorConsultarCombosFechasYTurnos(
			IRepositorio repositorio, 
			IConversor conversor, 
			ILogger log,
			IServicioRepositorio servicioRepositorio)
			: base(repositorio, conversor, log)
		{
			_servicioRepositorio = servicioRepositorio;
		}

		public override Resultado Ejecutar(ConsultarCombosFechasYTurnosRequest comando)
		{
			var response = new ConsultarCombosFechasYTurnosResponse();
			try
			{
				Log.Info("Iniciando ProcesadorConsultarCombosFechasYTurnos");
				var result = _servicioRepositorio.ConsultarCombosFechasYTurnos(comando.IdModuloDeCarga);
				if (result.Count > 0)
				{
					response.Fechas = result;
					response.FechaMinima = response.Fechas[0].Fecha;
					response.FechaMaxima = response.Fechas[response.Fechas.Count - 1].Fecha;
				}
				Log.Info("Finalizando ProcesadorConsultarCombosFechasYTurnos");
			}
			catch (Exception ex)
			{
				response.Errores.Add("", ex.Message);
				Log.Error(ex, "Ocurrió un error en ProcesadorConsultarCombosFechasYTurnos, error: {0}", ex.Message);
			}
			return response;
		}
	}
}
