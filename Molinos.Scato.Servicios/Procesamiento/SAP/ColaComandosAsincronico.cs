using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.SAP;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Ninject.Extensions.Logging;
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
		#region Propiedades Estaticas
		private static readonly ConcurrentDictionary<string, ConcurrentQueue<Comando>> _particiones =
			new ConcurrentDictionary<string, ConcurrentQueue<Comando>>();

		private static readonly ConcurrentDictionary<string, int> _particionesEnProceso =
			new ConcurrentDictionary<string, int>();

		private static int _workersActivos = 0;
		private const int MaxWorkersDefault = 3;
		#endregion

		#region Propiedades de Instancia
		private const int SegundosBloqueoReenvio = 60;

		private readonly Func<IServicioComandos> _fabricaServicioComandos;
		private readonly Func<IRepositorio> _fabricaRepositorio;
		private readonly ILogger log;
		#endregion

		public ColaComandosAsincronico(Func<IServicioComandos> fabricaServicioComandos,
			Func<IRepositorio> fabricaRepositorio, ILogger log)
		{
			_fabricaServicioComandos = fabricaServicioComandos;
			_fabricaRepositorio = fabricaRepositorio;
			this.log = log;
		}

		#region Public API
		public void Encolar(Comando comando)
		{
			var claveParticion = ObtenerClaveParticion(comando);
			if (claveParticion == null)
			{
				log.Warn($"[ColaComandosAsincronico] No se pudo determinar particion para {comando.GetType().Name}. Descartado.");
				return;
			}

			if (YaEstaEnParticion(comando, claveParticion))
			{
				log.Info($"[ColaComandosAsincronico] Comando {comando.GetType().Name} ya esta en cola para particion {claveParticion}. Descartado.");
				return;
			}

			if (ExisteEnvioRecienteOEnCurso(comando))
			{
				log.Info($"[ColaComandosAsincronico] Existe envio reciente o en curso para particion {claveParticion}. Descartado.");
				return;
			}

			var cola = _particiones.GetOrAdd(claveParticion, _ => new ConcurrentQueue<Comando>());
			cola.Enqueue(comando);

			log.Info($"[ColaComandosAsincronico] Comando {comando.GetType().Name} encolado en particion {claveParticion}.");

			IniciarWorkersNecesarios();
		}
		#endregion

		private static string ObtenerClaveParticion(Comando comando)
		{
			if (comando is EnviarBuqueSAP buq)
				return $"Vapor_{buq.VaporId}";

			if (comando is EnviarBajaBuqueSAP baja)
				return $"Vapor_{baja.VaporId}";

			if (comando is EnviarEmbarqueSAP emb)
				return $"Embarque_{emb.EmbarqueId}";

			return null;
		}


		#region Detectar duplicacion
		private static bool YaEstaEnParticion(Comando comandoNuevo, string claveParticion)
		{
			if (!_particiones.TryGetValue(claveParticion, out var cola))
				return false;

			foreach (var cmdEnMemoria in cola)
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

				if (comandoNuevo is EnviarBuqueSAP buqNuevo2 && cmdEnMemoria is EnviarBajaBuqueSAP bajaMemoria2)
				{
					if (buqNuevo2.VaporId == bajaMemoria2.VaporId) return true;
				}

				if (comandoNuevo is EnviarBajaBuqueSAP bajaNuevo2 && cmdEnMemoria is EnviarBuqueSAP buqMemoria2)
				{
					if (bajaNuevo2.VaporId == buqMemoria2.VaporId) return true;
				}
			}
			return false;
		}

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
		#endregion

		#region Manejo Worker
		private void IniciarWorkersNecesarios()
		{
			int maxWorkers = ObtenerMaxWorkers();

			foreach (var kvp in _particiones)
			{
				string clave = kvp.Key;
				var cola = kvp.Value;

				if (cola.IsEmpty)
					continue;

				if (Volatile.Read(ref _workersActivos) >= maxWorkers)
					break;

				var flag = _particionesEnProceso.GetOrAdd(clave, 0);
				if (flag == 1)
					continue;

				if (_particionesEnProceso.TryUpdate(clave, 1, 0))
				{
					int actuales = Volatile.Read(ref _workersActivos);
					if (actuales >= maxWorkers)
					{
						_particionesEnProceso.TryUpdate(clave, 0, 1);
						break;
					}

					Interlocked.Increment(ref _workersActivos);

					string claveCapturada = clave;
					HostingEnvironment.QueueBackgroundWorkItem(ct => WorkerProcesarParticion(claveCapturada));
				}
			}
		}

		private void WorkerProcesarParticion(string claveInicial)
		{
			string claveActual = claveInicial;

			try
			{
				var repositorio = _fabricaRepositorio();
				var paramMaxIntentos = repositorio.Obtener<Parametros>(p => p.Descripcion == "ConfiguracionReintentoSAP");
				var paramSegundosEspera = repositorio.Obtener<Parametros>(p => p.Descripcion == "ConfiguracionTiempoReintentoSAP");

				int maxIntentos = paramMaxIntentos?.Parametro2 ?? 3;
				int segundosEspera = paramSegundosEspera?.Parametro2 ?? 60;

				while (true)
				{
					if (_particiones.TryGetValue(claveActual, out var cola))
					{
						while (cola.TryDequeue(out Comando comandoActual))
						{
							ProcesarComando(comandoActual, maxIntentos, segundosEspera);
						}

						LimpiarParticionVacia(claveActual);
					}

					_particionesEnProceso.TryUpdate(claveActual, 0, 1);

					string siguienteParticion = BuscarParticionDisponible();
					if (siguienteParticion == null)
						break;

					claveActual = siguienteParticion;
				}
			}
			catch (Exception ex)
			{
				log.Error($"[ColaComandosAsincronico] Error fatal en worker para particion {claveActual}: {ex.Message}");
				_particionesEnProceso.TryUpdate(claveActual, 0, 1);
			}
			finally
			{
				Interlocked.Decrement(ref _workersActivos);

				if (_particiones.Any(p => !p.Value.IsEmpty))
				{
					IniciarWorkersNecesarios();
				}
			}
		}

		private string BuscarParticionDisponible()
		{
			foreach (var kvp in _particiones)
			{
				if (kvp.Value.IsEmpty)
					continue;

				_particionesEnProceso.TryAdd(kvp.Key, 0);
				if (_particionesEnProceso.TryUpdate(kvp.Key, 1, 0))
				{
					return kvp.Key;
				}
			}
			return null;
		}

		private void LimpiarParticionVacia(string clave)
		{
			if (_particiones.TryGetValue(clave, out var cola) && cola.IsEmpty)
			{
				_particiones.TryRemove(clave, out _);
				_particionesEnProceso.TryRemove(clave, out _);
			}
		}

		private int ObtenerMaxWorkers()
		{
			try
			{
				var repositorio = _fabricaRepositorio();
				var param = repositorio.Obtener<Parametros>(p => p.Descripcion == "ConfiguracionMaxWorkersSAP");
				return param?.Parametro2 ?? MaxWorkersDefault;
			}
			catch
			{
				return MaxWorkersDefault;
			}
		}

		#endregion

		#region Procesamiento de Comandos
		private void ProcesarComando(Comando comando, int maxIntentos, int segundosEspera)
		{
			var clave = ObtenerClaveParticion(comando) ?? comando.GetType().Name;

			for (int intento = 1; intento <= maxIntentos; intento++)
			{
				var servicioComandos = _fabricaServicioComandos();

				try
				{
					var resultadoEjecucion = servicioComandos.Ejecutar(comando);
					if (resultadoEjecucion != null && resultadoEjecucion.HayErrores)
					{
						var errorMsg = resultadoEjecucion.Errores.Values.FirstOrDefault() ?? "Error en SAP";
						throw new Exception(errorMsg);
					}

					log.Info($"[ColaComandosAsincronico] {comando.GetType().Name} enviado exitosamente para particion {clave}.");
					break; // SAP respondio OK
				}
				catch (Exception ex)
				{
					log.Error($"[ColaComandosAsincronico] Error al enviar a SAP (particion {clave}): {ex.Message}");

					if (intento < maxIntentos)
					{
						log.Error($"[ColaComandosAsincronico] Fallo {comando.GetType().Name} intento numero {intento}. Reintentando en {segundosEspera}s...");
						Thread.Sleep(TimeSpan.FromSeconds(segundosEspera));
					}
					else
					{
						log.Error($"[ColaComandosAsincronico] Fallo definitivo tras {maxIntentos} intentos para particion {clave}.");
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
		#endregion
	}
}