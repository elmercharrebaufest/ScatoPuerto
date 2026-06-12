using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.SAP;
using Molinos.Scato.Dominio.Dto.SAP;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Entidades.SAP;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.ServiciosSap;
using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento.SAP.Buque
{
	public class ProcesadorEnviarBajaBuqueSAP : ProcesadorComando<EnviarBajaBuqueSAP>
	{
		private readonly ZSDWS_SCATO _servicioSap;

		public ProcesadorEnviarBajaBuqueSAP(IRepositorio repositorio, IConversor conversor, ILogger log, ZSDWS_SCATO servicioSap)
			: base(repositorio, conversor, log)
		{
			_servicioSap = servicioSap;
		}

		public override Resultado Ejecutar(EnviarBajaBuqueSAP comando)
		{
			var resultado = new Resultado();

			// 1. Obtener la información de BD
			var vaporInfo = Repositorio.Obtener<VaporInformacion>(v => v.Vapor.Id == comando.VaporId);
			if (vaporInfo == null)
				throw new Exception($"No se encontró información para el vapor ID {comando.VaporId}");

			// 2. Crear el Request Mapeado con todos los campos (igual que el original)
			var requestSap = CrearRequestSap(vaporInfo);

			// 3. Crear la Transacción
			var transaccion = new TransaccionesSAP
			{
				Entidad = "VaporInformacion",  // Corregido: En el original era VaporInformacion, no Buque
				Entidad_Id = vaporInfo.Id,     // Corregido: Es el ID de la información, no del Vapor
				Operacion = "B", // Baja
				PayloadXML = XmlConverter<Z_SDMF_RFC_ABM_BUQUERequest>.Serialize(requestSap),
				Estado = "Pendiente",
				Reintento = 0,
				FechaCreacion = DateTime.Now,
				Usuario = comando.Usuario
			};

			Repositorio.Agregar(transaccion);
			Repositorio.GuardarCambios();

			string mensajeFrontend = "";
			try
			{
				// 4. Llamada a SAP
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
				mensajeFrontend = "SYSTEM_ERROR: " + errorReal.Message;

				try { Repositorio.GuardarCambios(); } catch { }
				throw new Exception(errorReal.Message);
			}

			if (transaccion.Estado == "Error")
				throw new Exception($"Error de SAP: {mensajeFrontend}");

			return resultado;
		}

		#region Métodos Privados Extrapolados

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
					IM_FLAG = "B", // Operación de Baja
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