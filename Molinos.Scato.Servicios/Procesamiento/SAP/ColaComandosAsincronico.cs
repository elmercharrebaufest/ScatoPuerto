using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.SAP;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Ninject.Extensions.Logging;
using NPOI.SS.Formula.Functions;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.ServiceModel;
using System.Threading;
using System.Web.Hosting;


namespace Molinos.Scato.Servicios.Procesamiento.SAP
{
	public class ColaComandosAsincronico : IColaComandosAsincronico
	{
		private static readonly ConcurrentQueue<Comando> _colaSAP = new ConcurrentQueue<Comando>();
		private static int _procesando = 0;

		private const int SegundosBloqueoReenvio = 60;

		private readonly Func<IServicioComandos> _fabricaServicioComandos;
		private readonly Func<IRepositorio> _fabricaRepositorio;
		private readonly ILogger log;

		public ColaComandosAsincronico(Func<IServicioComandos> fabricaServicioComandos, Func<IRepositorio> fabricaRepositorio,
			ILogger log)
		{
			_fabricaServicioComandos = fabricaServicioComandos;
			_fabricaRepositorio = fabricaRepositorio;
			this.log = log;
		}

		public void Encolar(Comando comando)
		{
			if (YaEstaEnCola(comando))
			{
				return;
			}

			if (ExisteEnvioRecienteOEnCurso(comando))
			{
				return;
			}

			_colaSAP.Enqueue(comando);

			if (Interlocked.CompareExchange(ref _procesando, 1, 0) == 0)
			{
				HostingEnvironment.QueueBackgroundWorkItem(ct => ProcesarCola());
			}
		}

		private static bool YaEstaEnCola(Comando comandoNuevo)
		{
			// Inspeccionamos la memoria para ver si el mismo ID ya esta encolado
			foreach (var cmdEnMemoria in _colaSAP)
			{
				if (comandoNuevo is EnviarEmbarqueSAP embNuevo && cmdEnMemoria is EnviarEmbarqueSAP embMemoria)
				{
					if (embNuevo.EmbarqueId == embMemoria.EmbarqueId) return true;
				}

				if (comandoNuevo is EnviarBuqueSAP buqNuevo && cmdEnMemoria is EnviarBuqueSAP buqMemoria)
				{
					if (buqNuevo.VaporId == buqMemoria.VaporId) return true;
				}

				if (comandoNuevo is EnviarBajaBuqueSAP bajaNuevo && cmdEnMemoria is EnviarBajaBuqueSAP bajaMemoria)
				{
					if (bajaNuevo.VaporId == bajaMemoria.VaporId) return true;
				}
			}
			return false;
		}

		// Evitar envios duplicados
		private bool ExisteEnvioRecienteOEnCurso(Comando comando)
		{
			string entidad = null;
			int entidadId = 0;

			var repositorio = _fabricaRepositorio();

			if (comando is EnviarEmbarqueSAP emb)
			{
				entidad = "Embarque";
				entidadId = emb.EmbarqueId;
			}
			else if (comando is EnviarBuqueSAP buq)
			{
				entidad = "VaporInformacion";
				entidadId = repositorio.Obtener<VaporInformacion>(v => v.Vapor.Id == buq.VaporId)?.Id ?? 0;
			}
			else if (comando is EnviarBajaBuqueSAP baja)
			{
				entidad = "VaporInformacion";
				entidadId = repositorio.Obtener<VaporInformacion>(v => v.Vapor.Id == baja.VaporId)?.Id ?? 0;
			}

			if (entidad == null || entidadId == 0)
				return false;

			var limite = DateTime.Now.AddSeconds(-SegundosBloqueoReenvio);

			return repositorio.Listar<TransaccionesSAP>(t =>
					t.Entidad == entidad &&
					t.Entidad_Id == entidadId &&
					(t.Estado == "Pendiente" || t.FechaCreacion >= limite))
				.Any();
		}

		private void ProcesarCola()
		{
			try
			{
				while (_colaSAP.TryDequeue(out Comando comandoActual))
				{
					int maxIntentos = 3;
					int segundosEspera = 5;

					for (int intento = 1; intento <= maxIntentos; intento++)
					{
						var servicioComandos = _fabricaServicioComandos();

						try
						{
							servicioComandos.Ejecutar(comandoActual);
							break; // SAP respondio OK
						}
						catch (Exception ex)
						{
							log.Error($"[ColaComandosAsincronico] Error al enviar a SAP: {ex.Message}");

							if (intento < maxIntentos)
							{
								log.Error($"[ColaComandosAsincronico] Fallo {comandoActual.GetType().Name} intento numero {intento}. Reintentando...");
								Thread.Sleep(TimeSpan.FromSeconds(segundosEspera));
							}
							else
							{
								log.Error($"[ColaComandosAsincronico] Fallo definitivo tras {maxIntentos} intentos.");
							}
						}
						finally
						{
							if (servicioComandos is ICommunicationObject canalWcf)
							{
								try
								{
									if (canalWcf.State != CommunicationState.Faulted)
										canalWcf.Close();
									else
										canalWcf.Abort();
								}
								catch
								{
									canalWcf.Abort();
								}
							}
						}
					}
				}
			}
			finally
			{
				Interlocked.Exchange(ref _procesando, 0);
			}
		}
	}
}