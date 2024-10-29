using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.RitmosBrutosYNetos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;

namespace Molinos.Scato.Servicios.Procesamiento.RitmosBrutosYNetos
{
	public class ProcesadorConsultarBalanzasCortes : ProcesadorComando<ConsultarBalanzasCortesRequest>
	{
		private readonly IServicioRepositorio _servicioRepositorio;

		public ProcesadorConsultarBalanzasCortes(
			IRepositorio repositorio,
			IConversor conversor,
			ILogger log,
			IServicioRepositorio servicioRepositorio)
			: base(repositorio, conversor, log)
		{
			_servicioRepositorio = servicioRepositorio;
		}

		public override Resultado Ejecutar(ConsultarBalanzasCortesRequest comando)
		{
			var response = new ConsultarBalanzasCortesResponse();
			try
			{
				Log.Info("Iniciando ProcesadorConsultarBalanzasCortes");
				var resultConsultarBalanzasCortes = _servicioRepositorio.ConsultarBalanzasCortes(comando.IdModuloDeCarga);
				if (resultConsultarBalanzasCortes.Count > 0)
				{
					var balanzasCortes = new List<BalanzaCorteFilledDto>();
					foreach (var item in resultConsultarBalanzasCortes)
					{
						var turnoPuertoDto = DeterminarTurno(Convert.ToDateTime(item.Fecha_Inicio));
						var balanzaCorteFilledDto = new BalanzaCorteFilledDto();
						balanzaCorteFilledDto.Id= item.Id;
						balanzaCorteFilledDto.IdTurnoPuerto = turnoPuertoDto.Id;
						balanzaCorteFilledDto.NombreTurnoPuerto = turnoPuertoDto.Nombre;
						balanzaCorteFilledDto.FechaInicio = item.Fecha_Inicio?.ToString("yyyy-MM-dd HH:mm:ss");
						balanzaCorteFilledDto.FechaCorte = item.Fecha_Corte?.ToString("yyyy-MM-dd HH:mm:ss");
						balanzaCorteFilledDto.IdBalanza = GetIdBalanza(item.NumeroBalanza);
						balanzaCorteFilledDto.NumeroBalanza = item.NumeroBalanza;
						balanzaCorteFilledDto.CorteManual = item.CorteManual;
						balanzaCorteFilledDto.Cantidad = item.Kg ?? 0;
						balanzasCortes.Add(balanzaCorteFilledDto);
					}
					response.BalanzasCortes = balanzasCortes;
				}
				Log.Info("Finalizando ProcesadorConsultarBalanzasCortes");
			}
			catch (Exception ex)
			{
				response.Errores.Add("", ex.Message);
				Log.Error(ex, "Ocurrió un error en ProcesadorConsultarBalanzasCortes, error: {0}", ex.Message);
			}
			return response;
		}

		public TurnoPuertoDto DeterminarTurno(DateTime fecha)
		{
			var hora = fecha.TimeOfDay;

			if (hora >= TimeSpan.FromHours(0) && hora < TimeSpan.FromHours(6))
			{
				return new TurnoPuertoDto { Id = 1, Nombre = "00-06", Orden = 1 }; // Turno 00-06
			}
			else if (hora >= TimeSpan.FromHours(6) && hora < TimeSpan.FromHours(12))
			{
				return new TurnoPuertoDto { Id = 2, Nombre = "06-12", Orden = 2 }; // Turno 06-12
			}
			else if (hora >= TimeSpan.FromHours(12) && hora < TimeSpan.FromHours(18))
			{
				return new TurnoPuertoDto { Id = 3, Nombre = "12-18", Orden = 3 }; // Turno 12-18
			}
			else if (hora >= TimeSpan.FromHours(18) && hora < TimeSpan.FromHours(24))
			{
				return new TurnoPuertoDto { Id = 4, Nombre = "18-24", Orden = 4 }; // Turno 18-24
			}

			throw new ArgumentOutOfRangeException("La hora no está en el rango esperado.");
		}

		public int GetIdBalanza(string numeroBalanza)
		{
			if (numeroBalanza.Equals("7"))
			{
				return 1;
			} 
			else if (numeroBalanza.Equals("8"))
			{
				return 2;
			}

			throw new ArgumentOutOfRangeException("La balanza no es identificado.");
		}
	}
}
