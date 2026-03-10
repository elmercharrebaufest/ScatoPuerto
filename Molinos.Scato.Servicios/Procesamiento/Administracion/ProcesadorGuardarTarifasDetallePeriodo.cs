using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
	public class ProcesadorGuardarTarifasDetallePeriodo : ProcesadorComando<GuardarTarifasDetallePeriodo>
	{
		private readonly IServicioAdministracion _servicioAdministracion;

		public ProcesadorGuardarTarifasDetallePeriodo(
			IRepositorio repositorio,
			IConversor conversor,
			ILogger log,
			IServicioAdministracion servicioAdministracion
		) : base(repositorio, conversor, log)
		{
			_servicioAdministracion = servicioAdministracion;
		}

		public override Resultado Ejecutar(GuardarTarifasDetallePeriodo comando)
		{
			var resultado = new Resultado();
			try
			{
				bool esNuevo = false;
				var dto = comando.TarifasPeriodo;
				var acuerdoDetalle = Repositorio.Obtener<AcuerdoDetalle>(dto.AcuerdoDetalleId)
					?? throw new Exception("No se encontró el detalle de acuerdo con el ID especificado");

				var periodo = new DateTime(dto.Periodo.Year, dto.Periodo.Month, 1);

				var conceptosIds = acuerdoDetalle.AcuerdoDetalleConceptos.Select(c => c.Id).ToList();

				var hayConceptosInvalidos = dto.Tarifas.Where(t => !conceptosIds.Contains(t.AcuerdoDetalleConceptoId)).Any();
				if (hayConceptosInvalidos)
				{
					throw new Exception("Uno o más conceptos no pertenecen al detalle del acuerdo");
				}

				if (dto.Tarifas.Count != conceptosIds.Count)
				{
					throw new Exception("Deben enviarse las tarifas de todos los conceptos");
				}

				var periodoDb = Repositorio.ObtenerPrimero<AcuerdoPeriodo>(p =>
					p.Periodo == periodo &&
					p.AcuerdoDetalleConceptoPeriodoTarifas.Any(t => conceptosIds.Contains(t.AcuerdoDetalleConcepto.Id)));

				if (periodoDb == null)
				{
					esNuevo = true;
					periodoDb = new AcuerdoPeriodo
					{
						Periodo = periodo,
						AcuerdoDetalleConceptoPeriodoTarifas = new List<AcuerdoDetalleConceptoPeriodoTarifa>(),
						Cerrado = false
					};
					Repositorio.Agregar(periodoDb);
					Repositorio.GuardarCambios();
				}

				if (periodoDb.Cerrado)
				{
					throw new Exception("El periodo se encuentra cerrado");
				}

				periodoDb.FechaActualizacion = DateTime.Now;
				periodoDb.UsuarioActualizacion = comando.Usuario;
				periodoDb.Cerrado = dto.Cerrar;

				foreach (var tarifaDto in dto.Tarifas)
				{
					var acuerdoDetalleConcepto = Repositorio.Obtener<AcuerdoDetalleConcepto>(tarifaDto.AcuerdoDetalleConceptoId)
						?? throw new Exception("No se encontro el detalle concepto con ID: " + tarifaDto.AcuerdoDetalleConceptoId);

					var tarifa = periodoDb.AcuerdoDetalleConceptoPeriodoTarifas
						.FirstOrDefault(t => t.AcuerdoDetalleConcepto.Id == tarifaDto.AcuerdoDetalleConceptoId);

					if (tarifa == null)
					{
						tarifa = new AcuerdoDetalleConceptoPeriodoTarifa
						{
							AcuerdoDetalleConcepto = acuerdoDetalleConcepto,
							AcuerdoPeriodo = periodoDb,
							ValorTarifa = tarifaDto.ValorTarifa
						};
						periodoDb.AcuerdoDetalleConceptoPeriodoTarifas.Add(tarifa);
					}
					else
					{
						tarifa.ValorTarifa = tarifaDto.ValorTarifa;
					}
				}

				var logABM = new LogABM
				{
					Pantalla = comando.GetType().Name,
					Usuario = comando.Usuario,
					Fecha = DateTime.Now,
					Evento = esNuevo ? EventoABM.Alta : EventoABM.Modificacion,
					Entidad = dto.Cerrar ? "CIERRE DE TARIFAS: " + dto.ToJson() : dto.ToJson(),
					ClaseId = acuerdoDetalle.Acuerdo.Id
				};
				Repositorio.Agregar(logABM);

				Repositorio.GuardarCambios();

				// Se fija si debe tener estado "Aplicado" los embarques vinculados
				if (dto.Cerrar)
				{
					EvaluarAplicadoParaEmbarquesDelAcuerdo(acuerdoDetalle, comando.Usuario);
				}
			}
			catch (Exception ex)
			{
				resultado.Error("", ex.Message);
				Log.Error("Error al guardar tarifas del detalle-período: {0}", ex);
			}
			return resultado;
		}

		private void EvaluarAplicadoParaEmbarquesDelAcuerdo(AcuerdoDetalle acuerdoDetalle, string usuario)
		{
			try
			{
				// Embarques vinculados
				var acuerdoEmbarques = Repositorio.Listar<AcuerdoEmbarque>(
					ae => ae.AcuerdoDetalle.Id == acuerdoDetalle.Id
				).ToList();

				var otrosDetallesIds = acuerdoDetalle.Acuerdo.AcuerdoDetalles
					.Select(d => d.Id)
					.ToList();

				var todosEmbarquesIds = Repositorio.Listar<AcuerdoEmbarque>(
					ae => otrosDetallesIds.Contains(ae.AcuerdoDetalle.Id)
				).Select(ae => ae.Embarque.Id)
				.Distinct()
				.ToList();

				foreach (var embarqueId in todosEmbarquesIds)
				{
					_servicioAdministracion.EvaluarEstadoAplicadoParaEmbarque(embarqueId, usuario);
				}
			}
			catch (Exception ex)
			{
				Log.Error("Error al evaluar estado Aplicado tras cierre de tarifas de acuerdo: {0}", ex);
			}
		}
	}
}