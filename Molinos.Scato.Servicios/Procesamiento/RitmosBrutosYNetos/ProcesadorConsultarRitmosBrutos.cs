using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.RitmosBrutosYNetos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento.RitmosBrutosYNetos
{
	public class ProcesadorConsultarRitmosBrutos : ProcesadorComando<ConsultarRitmosBrutosRequest>
	{
		private readonly IServicioRepositorio _servicioRepositorio;

		public ProcesadorConsultarRitmosBrutos(
			IRepositorio repositorio,
			IConversor conversor,
			ILogger log,
			IServicioRepositorio servicioRepositorio)
			: base(repositorio, conversor, log)
		{
			_servicioRepositorio = servicioRepositorio;
		}

		public override Resultado Ejecutar(ConsultarRitmosBrutosRequest comando)
		{
			var response = new ConsultarRitmosBrutosResponse();
			try
			{
				Log.Info("Iniciando ProcesadorConsultarRitmosBrutos");
				var result = _servicioRepositorio.ConsultarRitmos(comando.IdModuloDeCarga, comando.Fecha);
				if (result.Count > 0)
				{
					response.RitmosBrutos = result;
				}
				Log.Info("Finalizando ProcesadorConsultarRitmosBrutos");
			}
			catch (Exception ex)
			{
				response.Errores.Add("", ex.Message);
				Log.Error(ex, "Ocurrió un error en ProcesadorConsultarRitmosBrutos, error: {0}", ex.Message);
			}
			return response;
		}
	}
}
