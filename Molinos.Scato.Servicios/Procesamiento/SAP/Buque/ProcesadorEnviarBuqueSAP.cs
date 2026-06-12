using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.SAP;
using Molinos.Scato.Dominio.Dto.SAP;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Entidades.SAP;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.ServiciosSap;
using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using System;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento.SAP.Buque
{
	public class ProcesadorEnviarBuqueSAP : ProcesadorComando<EnviarBuqueSAP>
	{
		private readonly ZSDWS_SCATO _servicioSap;

		public ProcesadorEnviarBuqueSAP(IRepositorio repositorio, IConversor conversor, ILogger log, ZSDWS_SCATO servicioSap)
			: base(repositorio, conversor, log)
		{
			_servicioSap = servicioSap;
		}

		public override Resultado Ejecutar(EnviarBuqueSAP comando)
		{
			var resultado = new Resultado();

			// Obtener la información fresca desde la base de datos
			var vaporInfo = Repositorio.Obtener<VaporInformacion>(v => v.Vapor.Id == comando.VaporId);
			if (vaporInfo == null)
				throw new Exception($"No se encontró información para el vapor ID {comando.VaporId}");

			string operacionDefinitiva = comando.EstabaEnSap ? "M" : comando.OperacionSap;

			// 1. Crear el Request Mapeado
			var requestSap = CrearRequestSap(vaporInfo, operacionDefinitiva);

			// 2. Crear la Transacción (Calculando Reintentos)
			var transaccion = CrearTransaccion(vaporInfo, operacionDefinitiva, comando.Usuario, requestSap);

			string mensaje = string.Empty;

			try
			{
				var response = _servicioSap.Z_SDMF_RFC_ABM_BUQUE(requestSap);
				var responseXml = XmlConverter<Z_SDMF_RFC_ABM_BUQUEResponse1>.Serialize(response);
				var responseSap = response.Z_SDMF_RFC_ABM_BUQUEResponse;
				mensaje = responseSap.EX_MESSAGE;

				if (responseSap.EX_RESPONSE == "OK")
				{
					transaccion.Estado = "Enviado";
					transaccion.ResponseSAP = responseXml;
					vaporInfo.EnSap = true;
				}
				else
				{
					transaccion.Estado = "Error";
					transaccion.ResponseSAP = responseXml;
					vaporInfo.EnSap = comando.EstabaEnSap && operacionDefinitiva == "M";
				}

				AgregarLogEnvioSap(comando, vaporInfo, responseXml);
			}
			catch (Exception ex)
			{
				Exception errorReal = ex;
				while (errorReal.InnerException != null) errorReal = errorReal.InnerException;

				transaccion.Estado = "Error";
				transaccion.ResponseSAP = "<Error><Exception>" + errorReal.Message + "</Exception></Error>";
				vaporInfo.EnSap = comando.EstabaEnSap && operacionDefinitiva == "M";
				mensaje = "SYSTEM_ERROR: " + errorReal.Message;

				AgregarLogEnvioSap(comando, vaporInfo, transaccion.ResponseSAP);

				// Guardamos el estado de error antes de lanzar la excepción
				try { Repositorio.GuardarCambios(); } catch { }
				throw new Exception(errorReal.Message);
			}

			// Guardar cambios finales (Transaccion, Log y VaporInformacion.EnSap)
			Repositorio.GuardarCambios();

			if (transaccion.Estado == "Error")
				throw new Exception($"Error de SAP: {mensaje}");

			return resultado;
		}

		#region Metodos privados

		private Z_SDMF_RFC_ABM_BUQUERequest CrearRequestSap(VaporInformacion vaporInformacion, string operacion)
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
					IM_FLAG = operacion,
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

		private TransaccionesSAP CrearTransaccion(VaporInformacion vaporInformacion, string operacion, string usuario, Z_SDMF_RFC_ABM_BUQUERequest requestSap)
		{
			var ultimoIntento = Repositorio.Listar<TransaccionesSAP>(t => t.Entidad == "VaporInformacion" && t.Entidad_Id == vaporInformacion.Id)
				.OrderByDescending(t => t.Id)
				.FirstOrDefault();

			var valorReintento = ultimoIntento != null && ultimoIntento.Estado == "Error" ? ultimoIntento.Reintento + 1 : 0;

			var transaccion = new TransaccionesSAP
			{
				Entidad = "VaporInformacion",
				Entidad_Id = vaporInformacion.Id,
				Operacion = operacion,
				PayloadXML = XmlConverter<Z_SDMF_RFC_ABM_BUQUERequest>.Serialize(requestSap),
				Estado = "Pendiente",
				Reintento = valorReintento,
				FechaCreacion = DateTime.Now,
				Usuario = usuario
			};

			Repositorio.Agregar(transaccion);
			return transaccion;
		}

		private void AgregarLogEnvioSap(EnviarBuqueSAP comando, VaporInformacion vaporInformacion, string respuestaSap)
		{
			var logEnvio = new LogABM
			{
				Pantalla = comando.GetType().Name,
				Usuario = comando.Usuario,
				Fecha = DateTime.Now,
				Evento = EventoABM.Modificacion,
				Entidad = respuestaSap,
				ClaseId = vaporInformacion.Id
			};
			Repositorio.Agregar(logEnvio);
		}

		private decimal TruncarDosDecimales(decimal valor)
		{
			return Math.Truncate(valor * 100m) / 100m;
		}

		#endregion
	}
}