using Molinos.Scato.Dominio.Comandos;
using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Web.Hosting;

namespace Molinos.Scato.Servicios.Procesamiento.SAP
{
	public static class ColaComandosAsincronico
	{
		private static readonly ConcurrentQueue<Comando> colaSAP = new ConcurrentQueue<Comando>();
		private static int procesando = 0;

		public static Func<IServicioComandos> ProveedorServicioComandos { get; set; }

		public static void Encolar(Comando comando)
		{
			colaSAP.Enqueue(comando);

			if (Interlocked.CompareExchange(ref procesando, 1, 0) == 0)
			{
				HostingEnvironment.QueueBackgroundWorkItem(ct => ProcesarCola());
			}
		}

		private static void ProcesarCola()
		{
			try
			{
				while (colaSAP.TryDequeue(out Comando comandoActual))
				{
					try
					{
						if (ProveedorServicioComandos == null)
							throw new Exception("El proveedor de dependencias no está configurado.");

						var servicioComandos = ProveedorServicioComandos.Invoke();

						if (servicioComandos != null)
						{
							servicioComandos.Ejecutar(comandoActual);
						}
					}
					catch (Exception)
					{
						// Luego de 3 reintentos ver que hacer
					}
				}
			}
			finally
			{
				Interlocked.Exchange(ref procesando, 0);

				if (!colaSAP.IsEmpty && Interlocked.CompareExchange(ref procesando, 1, 0) == 0)
				{
					HostingEnvironment.QueueBackgroundWorkItem(ct => ProcesarCola());
				}
			}
		}
	}
}