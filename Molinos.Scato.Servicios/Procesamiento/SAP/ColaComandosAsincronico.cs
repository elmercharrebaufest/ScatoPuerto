using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.SAP; // Agregado para leer los comandos de SAP
using Molinos.Scato.Dominio.Entidades;      // NUEVO: para VaporInformacion
using Molinos.Scato.Dominio.Entidades.SAP;  // NUEVO: para TransaccionesSAP
using Molinos.Scato.Repositorio;            // NUEVO: para IRepositorio
using Molinos.Scato.Servicios;
using System;
using System.Collections.Concurrent;
using System.Linq;                          // NUEVO: para .Any()
using System.ServiceModel;
using System.Threading;
using System.Web.Hosting;


namespace Molinos.Scato.Servicios.Procesamiento.SAP
{
	public class ColaComandosAsincronico : IColaComandosAsincronico
	{
		// Al hacer estas variables STATIC, garantizamos una única cola global 
		// y un único hilo ejecutor independientemente de Ninject.
		private static readonly ConcurrentQueue<Comando> _colaSAP = new ConcurrentQueue<Comando>();
		private static int _procesando = 0;

		// Ventana (en segundos) durante la cual un reenvío del mismo comando se considera duplicado.
		private const int SegundosBloqueoReenvio = 60;

		private readonly Func<IServicioComandos> _fabricaServicioComandos;
		private readonly Func<IRepositorio> _fabricaRepositorio; // NUEVO

		public ColaComandosAsincronico(Func<IServicioComandos> fabricaServicioComandos, Func<IRepositorio> fabricaRepositorio)
		{
			_fabricaServicioComandos = fabricaServicioComandos;
			_fabricaRepositorio = fabricaRepositorio;
		}

		public void Encolar(Comando comando)
		{
			// 1. FILTRO EN MEMORIA: doble clic simultáneo (el comando todavía está en la cola).
			if (YaEstaEnCola(comando))
			{
				return;
			}

			// 2. FILTRO EN BASE DE DATOS (idempotencia real):
			// Si ya hay un envío Pendiente, o uno creado en los últimos segundos para
			// la misma entidad, descartamos el reenvío. Esto cubre los casos que el
			// filtro en memoria NO ve: reenvíos que llegan DESPUÉS de que el comando
			// ya fue desencolado/procesado (reintento de proxy, timeout del cliente,
			// reinicio del AppPool, varios procesos, etc.).
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
			// Inspeccionamos la memoria para ver si el mismo ID ya está encolado
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

		// NUEVO: consulta la BD (fuente de verdad compartida) para evitar duplicados
		// aunque el comando ya haya sido desencolado, el proceso se reinicie o existan
		// varios procesos (web garden / balanceador).
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

			// Tipo de comando no contemplado: no bloqueamos.
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
							break; // Si llega aquí, SAP respondió OK. Salimos del bucle.
						}
						catch (Exception ex)
						{
							if (intento < maxIntentos)
							{
								// Pausa para darle tiempo a la red/SAP de recuperarse
								Thread.Sleep(TimeSpan.FromSeconds(segundosEspera));
							}
						}
						finally
						{
							// Cerramos el canal WCF
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