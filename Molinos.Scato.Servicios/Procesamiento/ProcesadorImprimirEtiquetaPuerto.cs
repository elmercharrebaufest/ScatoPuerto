using System;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.ModuloImpresor.Zebra;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Impresiones;
using Molinos.Scato.Servicios.ServicioImpresion;
using Ninject.Extensions.Logging;
using PrintDoc2Pdf;

namespace Molinos.Scato.Servicios.Procesamiento
{
	public class ProcesadorImprimirEtiquetaPuerto : ProcesadorComando<ImprimirEtiquetaPuerto>
	{
		private readonly IServicioImpresion servicioImpresion;
		public ProcesadorImprimirEtiquetaPuerto(IRepositorio repositorio, IConversor conversor,
			ILogger log, IServicioImpresion servicioImpresion)
			: base(repositorio, conversor, log)
		{
			this.servicioImpresion = servicioImpresion;
		}

		public override Resultado Ejecutar(ImprimirEtiquetaPuerto comando)
		{
			try
			{
				Log.Debug($"[ProcesadorImprimirEtiquetaPuerto] UsuarioId: {comando.UsuarioId}, EtiquetaId: {comando.Id}, Impresora: '{comando.Impresora}'");

				var resultado = new Resultado();
				var etiquetas = comando.UsuarioId > 0 ? Repositorio.Listar<ImpEtiquetaPuerto>(x => x.Usuario_Id == comando.UsuarioId) : Repositorio.Listar<ImpEtiquetaPuerto>(x => x.Id == comando.Id);
				Log.Debug($"[ProcesadorImprimirEtiquetaPuerto] Se encontraron {etiquetas?.Count ?? 0} etiqueta(s) para procesar.");

				var impresora = new Impresora { Direccion = comando.Impresora };
				comando.Impresora = impresora.Direccion;

				foreach (var etiqueta in etiquetas)
				{
					Log.Debug($"[ProcesadorImprimirEtiquetaPuerto] Procesando etiqueta Id: {etiqueta.Id}");
					comando.Dto = AutoMapper.Mapper.Map<ImpEtiquetaPuerto, ImpEtiquetaPuertoDto>(etiqueta);
					var result = EjecutarImpresion(comando);
					if (result.HayErrores)
					{
						Log.Error($"[ProcesadorImprimirEtiquetaPuerto] Error al procesar etiqueta Id: {etiqueta.Id}");
						return result;
					}
					else
						resultado = result;
				}

				Log.Debug("[ProcesadorImprimirEtiquetaPuerto] Finalizado correctamente.");
				return resultado;
			}
			catch (Exception e)
			{
				Log.Error(e, "[ProcesadorImprimirEtiquetaPuerto] Error al imprimir en la impresora: " + comando.Impresora);
				throw;
			}
		}

		private Resultado EjecutarImpresion(ImprimirEtiquetaPuerto comando)
		{
			var resultado = new Resultado();

			try
			{
				Log.Debug("[ProcesadorImprimirEtiquetaPuerto] Iniciando impresión de ImprimirEtiquetaPuerto en la impresora: " + comando.Impresora);

				var impresora = new EtiquetaPuerto(comando.Dto, comando.Impresora, 0, 0, null);

				if (comando.Impresora == "")
				{
					try
					{
						var resultadoPdf = new ResultadoPrevisualizar();
						var printer = new pdfPrinter();

						if (!string.IsNullOrEmpty(impresora.ZplCode))
						{
							var ipImpresora = comando.IpImpresora;
							Log.Debug($"Se va a renderizar contra la impresora {ipImpresora}, el ticket: {impresora.ZplCode}");
							var imagen = ZebraPrinter.ObtenerImagen(impresora.ZplCode, ipImpresora, Log);
							printer.Document = new ImpresorDeImagenes(imagen);
						}
						else
						{
							printer.Document = impresora;
						}
						printer.Print();
						resultadoPdf.Archivo = printer.File;

						return resultadoPdf;
					}
					catch (Exception e)
					{
						Log.Error(e, "[ProcesadorImprimirEtiquetaPuerto] Error al generar etiqueta");
					}
				}

				impresora.Print();
			}
			catch (Exception e)
			{
				Log.Error(e, "[ProcesadorImprimirEtiquetaPuerto] Error al imprimir en la impresora: " + comando.Impresora);
				throw;
			}
			return resultado;
		}
	}
}

