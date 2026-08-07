using System;
using System.Configuration;
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
				var resultado = new Resultado();
				var etiquetas = comando.UsuarioId > 0 ? Repositorio.Listar<ImpEtiquetaPuerto>(x => x.Usuario_Id == comando.UsuarioId) : Repositorio.Listar<ImpEtiquetaPuerto>(x => x.Id == comando.Id);
				var impresora = new Impresora { Direccion = comando.Impresora };
				comando.Impresora = impresora.Direccion;

				foreach (var etiqueta in etiquetas)
				{
					comando.Dto = AutoMapper.Mapper.Map<ImpEtiquetaPuerto, ImpEtiquetaPuertoDto>(etiqueta);
					var result = EjecutarImpresion(comando);
					if (result.HayErrores)
						return result;
					else
						resultado = result;
				}

				return resultado;
			}
			catch (Exception e)
			{
				Log.Error(e, "Error al imprimir en la impresora: " + comando.Impresora);
				throw;
			}
		}

		private Resultado EjecutarImpresion(ImprimirEtiquetaPuerto comando)
		{
			var resultado = new Resultado();

			try
			{
				Log.Debug("Iniciando impresión de ImprimirEtiquetaPuerto en la impresora: " + comando.Impresora);

				var impresora = new EtiquetaPuerto(comando.Dto, comando.Impresora, 0, 0, null);

				if (comando.Impresora == "")
				{
					try
					{
						var resultadoPdf = new ResultadoPrevisualizar();
						var printer = new pdfPrinter();

						if (!string.IsNullOrEmpty(impresora.ZplCode))
						{
							Log.Debug($"Se va a renderizar contra la impresora {ConfigurationManager.AppSettings["ZebraPrinterIp"]}, el ticket: {impresora.ZplCode}");
							var imagen = ZebraPrinter.ObtenerImagen(impresora.ZplCode, ConfigurationManager.AppSettings["ZebraPrinterIp"], Log);
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
						Log.Error(e, "Error al generar etiqueta");
					}
				}

				impresora.Print();
			}
			catch (Exception e)
			{
				Log.Error(e, "Error al imprimir en la impresora: " + comando.Impresora);
				throw;
			}
			return resultado;
		}
	}
}

