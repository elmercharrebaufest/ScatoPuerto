using System;
using System.Collections.Generic;
using System.Globalization;
using System.Transactions;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Entidades.SAP;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Orquestador;
using Molinos.Scato.Servicios.ServiciosSap;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
	public class ProcesadorEnviarLecturaBalanzadaTransmisionASap : ProcesadorComando<EnviarLecturaBalanzadaTransmisionASap>
	{
		private readonly ZSDWS_SCATO servicioSap;
		private readonly IServicioOrquestador orquestador;

		public ProcesadorEnviarLecturaBalanzadaTransmisionASap(IRepositorio repositorio, IConversor conversor, ILogger log, ZSDWS_SCATO servicioSap, IServicioOrquestador orquestador)
			: base(repositorio, conversor, log)
		{
			this.servicioSap = servicioSap;
			this.orquestador = orquestador;
		}

		public override Resultado Ejecutar(EnviarLecturaBalanzadaTransmisionASap comando)
		{
			var resultado = new ResultadoCrear();
			using (var transaction = new TransactionScope(TransactionScopeOption.Suppress))
			{
				Log.Info("[ProcesadorEnviarLecturaBalanzadaTransmisionASap] (Ejecutar) Iniciando ZE7550TransmisionASap");

				//Obtenemos balanzada
				var balanzada = Repositorio.Obtener<Balanzada>(x => x.Id == comando.Id && x.NumeroBalanza == comando.NumeroBalanza);
				if (balanzada.CargaInicial == null || balanzada.CargaInicial.Material == null || balanzada.CargaInicial.Exportador == null)
				{
					Log.Error("Error al enviar la balanzada " + comando.Id + " a SAP");
					resultado.Errores.Add("404", "Error. La carga no posee comodity y/o exportador. ");
					return resultado;
				}
				if (balanzada.CargaInicial.Material.Almacen == null)
				{
					Log.Error("Error al enviar la balanzada " + comando.Id + " a SAP");
					resultado.Errores.Add("404", "Error. El commodity no tiene asignado un almacén. ");
					return resultado;
				}
				var materialAlmacen = new { CodigoSapMaterial = balanzada.CargaInicial.Material.CodigoSAP, CodigoSapAlmacen = balanzada.CargaInicial.Material.Almacen.CodigoSAP };
				if (materialAlmacen == null || string.IsNullOrEmpty(materialAlmacen.CodigoSapMaterial) || string.IsNullOrEmpty(materialAlmacen.CodigoSapAlmacen))
				{
					Log.Error("Error al enviar la balanzada " + comando.Id + " a SAP");
					resultado.Errores.Add("404", "Error al buscar codigo Sap para el envio de la commodity");
					return resultado;
				}

				var exportador = Repositorio.Obtener<Exportador>(x => x.Id == balanzada.CargaInicial.Exportador.Id);

				var envioSAPBalanzadasActivo = Repositorio.ObtenerPrimero<Parametros>(p => p.Descripcion == "ConfiguracionEnvioSAPBalanzadas");
				bool habilitarEnvioMov311 = envioSAPBalanzadasActivo != null &&
											envioSAPBalanzadasActivo.Activo  &&
											envioSAPBalanzadasActivo.Parametro1;

				if (habilitarEnvioMov311)
				{
					var request = new Z_SDMF_RFC_MOV_311
					{
						EX_BLDAT = balanzada.Fecha.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), //fecha balanzada
						EX_BUDAT = balanzada.Fecha.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), //fecha balanzada
						EX_CHARG = "", //vacio
						EX_LGORT_DEST = exportador.Almacen != null ? exportador.Almacen.CodigoSAP : "", //codigo sap del almacen del exportador
						EX_LGORT_ORIG = materialAlmacen.CodigoSapAlmacen, //almacen de origen de la commodity
						EX_MATNR = materialAlmacen.CodigoSapMaterial, //material sap asociado a la commodity 
						EX_MEINS = "KG",
						EX_MENGE = balanzada.PesoNeto, //peso neto
						EX_TCODE = "MB1B",
						EX_TESTRUN = "", //vacio
						EX_WERKS = "1029" //centro san lorenzo
					};

					Log.Info("Request " + balanzada.Id + " para RFC Z_SDMF_RFC_MOV_311: " + request.ToXml());

					var transaccion = new TransaccionesSAP
					{
						Entidad = "Balanzada",
						Entidad_Id = balanzada.Id,
						Operacion = "A",
						PayloadXML = request.ToXml(),
						Estado = "Pendiente",
						Reintento = 0,
						FechaCreacion = DateTime.Now,
						Usuario = comando.Usuario,
						DetallesBalanzada = new List<TransaccionesSAPBalanzada>()
					};

					var detalleBalanzada = new TransaccionesSAPBalanzada
					{
						BalanzadaId = balanzada.Id,
						NumeroBalanza = balanzada.NumeroBalanza,
						MaterialSap = materialAlmacen.CodigoSapMaterial,
						ExportadorSap = exportador?.CodigoSap ?? string.Empty,
						AlmacenOrigenSap = materialAlmacen.CodigoSapAlmacen,
						AlmacenDestinoSap = exportador?.Almacen != null ? exportador.Almacen.CodigoSAP : string.Empty,
						PesoNeto = balanzada.PesoNeto,
						Fecha = balanzada.Fecha,
						Estado = "Pendiente"
					};

					transaccion.DetallesBalanzada.Add(detalleBalanzada);
					Repositorio.Agregar(transaccion);

					var response = servicioSap.Z_SDMF_RFC_MOV_311(new Z_SDMF_RFC_MOV_311Request
					{
						Z_SDMF_RFC_MOV_311 = request
					});
					Log.Info("Response " + balanzada.Id + "para RFC Z_SDMF_RFC_MOV_311: " + response.ToXml());

					transaccion.ResponseSAP = response.ToXml();

					if (string.IsNullOrEmpty(response.Z_SDMF_RFC_MOV_311Response.IM_MESSAGE) || balanzada.PesoNeto == 0)
					{
						balanzada.EnviadoASap = true;
						transaccion.Estado = "Enviado";
						detalleBalanzada.Estado = "Enviado";
					}
					else
					{
						balanzada.ErrorSap = response.Z_SDMF_RFC_MOV_311Response.IM_MESSAGE;
						transaccion.Estado = "Error";
						detalleBalanzada.Estado = "Error";
						resultado.Errores.Add("405", response.Z_SDMF_RFC_MOV_311Response.IM_MESSAGE);
					}

					Repositorio.GuardarCambios();
					Log.Info("Cambios guardados");
					Log.Info("Borrando datos en el PLC de la balanzada {0} con numero de balanza {1}", balanzada.Id, balanzada.NumeroBalanza);

					try
					{
						var balanza = Repositorio.Obtener<BalanzaPuerto>(x => x.CodigoBalanza == comando.NumeroBalanza);
						if (balanza != null)
						{
							orquestador.Ejecutar(new EjecutarBorrarBalanzada { CodigoDispositivo = balanza.CodigoDispositivo, IdBorrado = balanzada.Id - balanza.OffSetPlc });
						}
						else
						{
							Log.Warn("No se encontró la BalanzaPuerto con CodigoBalanza '{0}'. No se ejecutó el borrado del PLC.", comando.NumeroBalanza);
						}
					}
					catch (Exception exOrquestador)
					{
						Log.Error(exOrquestador, "No se pudo borrar la balanzada {0} del PLC (orquestador no disponible). La operación SAP fue exitosa.", balanzada.Id);
					}

					var inicio = Repositorio.Obtener<Carga>(x => x.Id == balanzada.CargaInicial_Id &&
															x.NumeroBalanza == balanzada.NumeroBalanza &&
															x.CargaOpuesta_Id.HasValue);
					if (inicio != null && balanzada.EnviadoASap)
					{
						inicio.EnviadoASap = !Repositorio.Existe<Balanzada>(x => x.CargaInicial_Id == inicio.Id && x.NumeroBalanza == inicio.NumeroBalanza && !x.EnviadoASap);
					}

					Repositorio.GuardarCambios();
				}
				else
				{
					Log.Info("[ProcesadorEnviarLecturaBalanzadaTransmisionASap] Envio SAP MOV_311 deshabilitado por Parametro (ConfiguracionEnvioSAPBalanzadas). Balanzada: " + balanzada.Id + ", Balanza: " + balanzada.NumeroBalanza);
				}

				transaction.Complete();
			}

			return resultado;
		}
	}
}