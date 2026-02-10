using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento
{
	public class ProcesadorGuardarTarifaDolar : ProcesadorModificar<GuardarTarifaDolar>
	{
		public ProcesadorGuardarTarifaDolar(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio = null)
			: base(repositorio, conversor, log, servicioRepositorio)
		{
		}

		protected override void ModificarEntidad(GuardarTarifaDolar comando)
		{
			var fechaPeriodo = new DateTime(comando.Dto.Periodo.Year, comando.Dto.Periodo.Month, 1);

			var tarifaExistente = this.Repositorio.Obtener<TarifaCotizacionDolar>(
				tc => tc.Periodo == fechaPeriodo);

			if (tarifaExistente != null)
			{
				// Modificacion
				tarifaExistente.ValorDolar = comando.Dto.ValorDolar;
				tarifaExistente.FechaActualizacion = DateTime.Now;
				tarifaExistente.UsuarioActualizacion = comando.Usuario;				

				AgregarLog(comando, EventoABM.Modificacion, tarifaExistente.Id, fechaPeriodo);
			}
			else
			{
				// Alta
				var nuevaTarifa = new TarifaCotizacionDolar
				{
					Periodo = fechaPeriodo,
					ValorDolar = comando.Dto.ValorDolar,
					FechaActualizacion = DateTime.Now,
					UsuarioActualizacion = comando.Usuario
				};

				this.Repositorio.Agregar(nuevaTarifa);

				this.Repositorio.GuardarCambios();

				AgregarLog(comando, EventoABM.Alta, nuevaTarifa.Id, fechaPeriodo);
			}

			this.Repositorio.GuardarCambios();
		}

		protected override void Validar(GuardarTarifaDolar comando, Resultado resultado)
		{
			if (comando.Dto.ValorDolar <= 0)
			{
				resultado.Errores.Add("", "Debe ingresar un valor en la tarifa");
			}

			var fechaPeriodo = new DateTime(comando.Dto.Periodo.Year, comando.Dto.Periodo.Month, 1);
			var hoy = DateTime.Now;
			var mesAnterior = new DateTime(hoy.Year, hoy.Month, 1).AddMonths(-1);

			if (fechaPeriodo < mesAnterior)
			{
				resultado.Errores.Add("", "No se puede editar períodos anteriores al mes anterior al actual");
			}
		}

		private void AgregarLog(GuardarTarifaDolar comando, EventoABM evento, int claseId, DateTime periodo)
		{
			var entidadLog = $"Tarifa Cotización Dólar Período: {periodo} - Valor: ${comando.Dto.ValorDolar}";

			var logAbm = new LogABM
			{
				Pantalla = "TarifaCotizacionDolar",
				Usuario = comando.Usuario,
				Fecha = DateTime.Now,
				Evento = evento,
				Entidad = entidadLog,
				ClaseId = claseId
			};
			Repositorio.Agregar(logAbm);
		}
	}
}