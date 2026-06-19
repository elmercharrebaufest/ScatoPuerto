using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.SAP;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.ServiciosSap;
using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento.SAP.Buque
{
	public class ProcesadorEnviarBajaBuqueSAP : ProcesadorComando<EnviarBajaBuqueSAP>
	{
		private readonly ZSDWS_SCATO _servicioSap;
		private readonly IServicioComandos _servicioComandos;
		private readonly ILogger log;

		public ProcesadorEnviarBajaBuqueSAP(IRepositorio repositorio, IConversor conversor, ILogger log,
			ZSDWS_SCATO servicioSap, IServicioComandos servicioComandos)
			: base(repositorio, conversor, log)
		{
			_servicioSap = servicioSap;
			_servicioComandos = servicioComandos;
			this.log = log;
		}

		public override Resultado Ejecutar(EnviarBajaBuqueSAP comando)
		{
			var resultado = new Resultado();

			var vaporInfo = Repositorio.Obtener<VaporInformacion>(v => v.Vapor.Id == comando.VaporId);
			if (vaporInfo == null)
			{
				resultado.Error("sapError", $"No se encontró información para el vapor ID {comando.VaporId}");
				return resultado;
			}

			var requestSap = CrearRequestSap(vaporInfo);

			var ultimoIntento = Repositorio.Listar<TransaccionesSAP>(t =>
					t.Entidad == "VaporInformacion" &&
					t.Entidad_Id == vaporInfo.Id &&
					t.Operacion == "B")
				.OrderByDescending(t => t.Id)
				.FirstOrDefault();

			var valorReintento = ultimoIntento != null && ultimoIntento.Estado == "Error" ? ultimoIntento.Reintento + 1 : 0;

			var transaccion = new TransaccionesSAP
			{
				Entidad = "VaporInformacion",
				Entidad_Id = vaporInfo.Id,
				Operacion = "B", // Baja
				PayloadXML = XmlConverter<Z_SDMF_RFC_ABM_BUQUERequest>.Serialize(requestSap),
				Estado = "Pendiente",
				Reintento = valorReintento,
				FechaCreacion = DateTime.Now,
				Usuario = comando.Usuario
			};

			Repositorio.Agregar(transaccion);
			Repositorio.GuardarCambios();

			string mensajeFrontend = "";
			try
			{
				var response = _servicioSap.Z_SDMF_RFC_ABM_BUQUE(requestSap);
				var responseXml = XmlConverter<Z_SDMF_RFC_ABM_BUQUEResponse1>.Serialize(response);
				mensajeFrontend = response.Z_SDMF_RFC_ABM_BUQUEResponse.EX_MESSAGE;

				if (response.Z_SDMF_RFC_ABM_BUQUEResponse.EX_RESPONSE == "OK")
				{
					transaccion.Estado = "Enviado";
				}
				else
				{
					transaccion.Estado = "Error";
				}

				transaccion.ResponseSAP = responseXml;
				Repositorio.GuardarCambios();
			}
			catch (Exception ex)
			{
				Exception errorReal = ex;
				while (errorReal.InnerException != null) errorReal = errorReal.InnerException;

				transaccion.Estado = "Error";
				transaccion.ResponseSAP = $"<Error><Exception>{errorReal.Message}</Exception></Error>";

				try { Repositorio.GuardarCambios(); } catch { }

				ManejarAlertaDeFalloDefinitivo(transaccion, vaporInfo);

				Log.Error(ex, "Error en ProcesadorEnviarBajaBuqueSAP");
				resultado.Error("sapError", errorReal.Message);
				return resultado;
			}

			if (transaccion.Estado == "Error")
			{
				ManejarAlertaDeFalloDefinitivo(transaccion, vaporInfo);
				resultado.Error("sapError", $"Error de SAP: {mensajeFrontend}");
			}

			return resultado;
		}

		#region Métodos Privados Extrapolados

		private void ManejarAlertaDeFalloDefinitivo(TransaccionesSAP transaccion, VaporInformacion vaporInfo)
		{
			// Intento 0, el 1 y el 2 (3 intentos en total)
			if (transaccion.Reintento == 2)
			{
				try
				{
					_servicioComandos.Ejecutar(new EnvioMail
					{
						Destinatarios = new List<string> { "Scatopuerto@baufest.com" },
						Copia = new List<string>(),
						Titulo = $"ERROR SAP en Buque {vaporInfo.NombreBuque} a eliminar",
						Cuerpo = $"Luego de 3 intentos fallidos de eliminar en SAP es necesario verificar el buque {vaporInfo.NombreBuque} con el IMO {vaporInfo.ImoVapor}.",
						AttachmentName = null
					});

					log.Info($"[Alerta SAP] Correo enviado a soporte por fallo definitivo en eliminación de buque {vaporInfo.NombreBuque}");
				}
				catch (Exception ex)
				{
					log.Error($"[Alerta SAP] No se pudo enviar el correo de alerta por baja de buque fallida: {ex.Message}", ex);
				}
			}
		}

		private Z_SDMF_RFC_ABM_BUQUERequest CrearRequestSap(VaporInformacion vaporInformacion)
		{
			var tipoCarga = vaporInformacion.TipoBuque == "Bulk Carrier" ? "S" : vaporInformacion.TipoBuque == "Oil Tanker" ? "L" : string.Empty;

			var eslora = TruncarDosDecimales(vaporInformacion.Eslora);
			var manga = TruncarDosDecimales(vaporInformacion.Manga);
			var puntal = TruncarDosDecimales(vaporInformacion.Puntual);
			var porteBruto = TruncarDosDecimales(vaporInformacion.PorteBruto);
			var porteNeto = TruncarDosDecimales(vaporInformacion.PorteNeto);

			return new Z_SDMF_RFC_ABM_BUQUERequest
			{
				Z_SDMF_RFC_ABM_BUQUE = new Z_SDMF_RFC_ABM_BUQUE
				{
					IM_FLAG = "B", // Baja
					IM_IMO = vaporInformacion.ImoVapor,
					IM_DESCR = (vaporInformacion.NombreBuque ?? string.Empty).Length > 40 ? vaporInformacion.NombreBuque.Substring(0, 40) : vaporInformacion.NombreBuque,
					IM_CARACT = string.Empty,
					IM_ESLORA = eslora,
					IM_ESLORASpecified = eslora > 0,
					IM_MANGA = manga,
					IM_MANGASpecified = manga > 0,
					IM_PUNTAL = puntal,
					IM_PUNTALSpecified = puntal > 0,
					IM_PAISPROC = vaporInformacion.Bandera != null ? vaporInformacion.Bandera.Abreviatura : string.Empty,
					IM_PORTEBRUTO = porteBruto,
					IM_PORTEBRUTOSpecified = porteBruto > 0,
					IM_PORTENETO = porteNeto,
					IM_PORTENETOSpecified = porteNeto > 0,
					IM_TIPOCARGA = tipoCarga,
					IM_BODEGAS = vaporInformacion.CantidadBodegasTks,
					IM_BODEGASSpecified = vaporInformacion.CantidadBodegasTks > 0,
					IM_FECHA = DateTime.Now.ToString("yyyy-MM-dd")
				}
			};
		}

		private decimal TruncarDosDecimales(decimal valor)
		{
			return Math.Truncate(valor * 100m) / 100m;
		}

		#endregion
	}
}