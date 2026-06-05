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
using System.Collections.Generic;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento.SAP
{
	public class ProcesadorEnviarEmbarqueSAP : ProcesadorComando<EnviarEmbarqueSAP>
	{
		private readonly ZSDWS_SCATO _servicioSap;

		public ProcesadorEnviarEmbarqueSAP(IRepositorio repositorio, IConversor conversor, ILogger log, ZSDWS_SCATO servicioSap)
			: base(repositorio, conversor, log)
		{
			_servicioSap = servicioSap;
		}

		public override Resultado Ejecutar(EnviarEmbarqueSAP comando)
		{
			var resultado = new Resultado();
			var embarque = Repositorio.Obtener<Embarque>(e => e.Id == comando.EmbarqueId);

			var intentosPrevios = Repositorio.Listar<TransaccionesSAP>(t => t.Entidad == "Embarque" && t.Entidad_Id == embarque.Id)
											 .OrderByDescending(t => t.Id)
											 .ToList();

			var ultimoIntento = intentosPrevios.FirstOrDefault();
			var ultimoExitoso = intentosPrevios.FirstOrDefault(t =>
				t.Estado == "Enviado" ||
				(t.ResponseSAP != null && t.ResponseSAP.Contains("Número de operación ya existente")));

			bool fueEnviadoPreviamente = ultimoExitoso != null;

			int valorReintento = 0;
			if (ultimoIntento != null && ultimoIntento.Estado == "Error")
			{
				valorReintento = ultimoIntento.Reintento + 1;
			}

			string operacionCabecera = fueEnviadoPreviamente ? "M" : "A";

			var transaccion = new TransaccionesSAP
			{
				Entidad = "Embarque",
				Entidad_Id = embarque.Id,
				Operacion = operacionCabecera,
				Estado = "Pendiente",
				Reintento = valorReintento,
				FechaCreacion = DateTime.Now,
				Usuario = comando.Usuario,
				DetallesEmbarque = new List<TransaccionesSAPDetallesEmbarque>()
			};

			Repositorio.Agregar(transaccion);
			Repositorio.GuardarCambios();

			string mensajeFrontend = "";
			try
			{
				var vaporInformacion = Repositorio.Obtener<VaporInformacion>(v => v.Vapor.Id == embarque.Vapor.Id);

				// Armado de Detalles a partir de las cargas fisicas
				var primerCoordinador = Repositorio.ListarConsultable<EmbarqueCoordinador>(c => c.Embarque.Id == comando.EmbarqueId).FirstOrDefault();
				string coordinadorSap = primerCoordinador?.CoordinadorPuerto?.CodigoSap ?? "";

				var lineUp = Repositorio.Obtener<LineUp>(l => l.Embarque.Id == comando.EmbarqueId);
				int moduloCargaId = lineUp?.ModuloDeCarga?.Id ?? 0;

				string fechaCierreOp = lineUp?.ModuloDeCarga?.FechaZarpado != null
									? lineUp.ModuloDeCarga.FechaZarpado.Value.ToString("yyyy-MM-dd")
									: "";

				// Solidos
				var detallesSolidos = Repositorio.ListarConsultable<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(
					d => d.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id == moduloCargaId && d.Cantidad > 0)
				.Select(d => new {
					ExportadorId = d.Exportador.Id,
					ExportadorSap = d.Exportador.CodigoSap,
					MaterialId = d.MaterialPuerto.Id,
					MaterialSap = d.MaterialPuerto.CodigoSAP,
					DestinoSap = d.Destino != null ? d.Destino.CodigoSap : "",
					Cantidad = (decimal)d.Cantidad
				}).ToList();

				// Liquidos
				var detallesLiquidos = Repositorio.ListarConsultable<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>(
					d => d.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id == moduloCargaId && d.Cantidad > 0)
				.Select(d => new {
					ExportadorId = d.Exportador.Id,
					ExportadorSap = d.Exportador.CodigoSap,
					MaterialId = d.MaterialPuerto.Id,
					MaterialSap = d.MaterialPuerto.CodigoSAP,
					DestinoSap = d.Destino != null ? d.Destino.CodigoSap : "",
					Cantidad = (decimal)d.Cantidad * 1000m
				}).ToList();

				var cargasFisicasSinAgrupar = detallesSolidos.Count > 0 ? detallesSolidos : detallesLiquidos;
				var nominaciones = Repositorio.Listar<Nominacion>(n => n.Embarque.Id == comando.EmbarqueId).ToList();

				var cargasMapeadas = cargasFisicasSinAgrupar.Select(carga => {
					var nominacion = nominaciones.FirstOrDefault(n =>
						n.NominacionDatoTecnico.MaterialPuerto.Id == carga.MaterialId &&
						n.NominacionDatoTecnico.NominacionDatoTecnicoExportador.Any(e => e.Exportador.Id == carga.ExportadorId));

					if (nominacion == null)
						throw new Exception($"Falta la Nominación Comercial para el material {carga.MaterialSap} y Exportador {carga.ExportadorSap}.");

					// TipoDeContrato (FAS, FOB, CIF)
					int tipoContratoId = nominacion.NominacionDatoTecnico.TipoDeContrato?.Id ?? 0;

					return new
					{
						ExportadorSap = carga.ExportadorSap,
						MaterialSap = carga.MaterialSap,
						DestinoSap = carga.DestinoSap,
						NominacionId = nominacion.Id,
						TipoDeContratoId = tipoContratoId,
						Cantidad = carga.Cantidad
					};
				}).ToList();

				var cargasFisicas = cargasMapeadas
					.GroupBy(x => new { x.ExportadorSap, x.MaterialSap, x.DestinoSap, x.NominacionId, x.TipoDeContratoId })
					.Select(g => new CargaFisicaEmbarqueItemSAP
					{
						ExportadorSap = g.Key.ExportadorSap,
						MaterialSap = g.Key.MaterialSap,
						DestinoSap = g.Key.DestinoSap,
						NominacionId = g.Key.NominacionId,
						TipoDeContratoId = g.Key.TipoDeContratoId,
						Cantidad = g.Sum(x => x.Cantidad)
					}).ToList();

				decimal totalKilogramos = cargasFisicas.Sum(c => c.Cantidad);

				var contratoFAS = Repositorio.Obtener<TipoDeContrato>(t => t.Descripcion == "FAS");
				var idContratoFAS = contratoFAS != null ? contratoFAS.Id : 0;

				var detallesPrevios = new List<TransaccionesSAPDetallesEmbarque>();
				var variacionesPorNominacion = new Dictionary<int, int>();

				long valorNroNomFAS = 2100000000L;
				var ultimoDetalleFas = Repositorio.ListarConsultable<TransaccionesSAPDetallesEmbarque>(d => d.NroNom_SAP != null && d.NroNom_SAP.StartsWith("21"))
												  .OrderByDescending(d => d.Id)
												  .FirstOrDefault();
				if (ultimoDetalleFas != null && long.TryParse(ultimoDetalleFas.NroNom_SAP, out long ultimoFasGlobal))
				{
					valorNroNomFAS = ultimoFasGlobal;
				}

				if (fueEnviadoPreviamente)
				{
					detallesPrevios = Repositorio.Listar<TransaccionesSAPDetallesEmbarque>(d => d.TransaccionesSAP_Id == ultimoExitoso.Id).ToList();

					foreach (var detallePrevio in detallesPrevios)
					{
						if (detallePrevio.TipoDeContratoId != idContratoFAS && detallePrevio.NroNom_SAP.StartsWith("20") && detallePrevio.NroNom_SAP.Length == 10)
						{
							if (int.TryParse(detallePrevio.NroNom_SAP.Substring(2, 2), out int indiceNominacion))
							{
								if (!variacionesPorNominacion.ContainsKey(detallePrevio.NominacionId) ||
									variacionesPorNominacion[detallePrevio.NominacionId] < indiceNominacion)
									variacionesPorNominacion[detallePrevio.NominacionId] = indiceNominacion;
							}
						}
					}
				}

				var listaDetallesSap = new List<ZFIES1450>();

				ProcesarAltasYModificacionesDetalles(cargasFisicas, detallesPrevios, operacionCabecera, idContratoFAS, coordinadorSap,
					ref valorNroNomFAS, variacionesPorNominacion, listaDetallesSap, transaccion);

				if (operacionCabecera == "M")
				{
					ProcesarBajasDetalles(detallesPrevios, cargasFisicas, listaDetallesSap, transaccion);
				}

				var requestSap = new Z_SDMF_RFC_ABM_OP_DETALLESRequest
				{
					Z_SDMF_RFC_ABM_OP_DETALLES = new Z_SDMF_RFC_ABM_OP_DETALLES
					{
						IM_FLAG = operacionCabecera,
						IM_NUMOP = embarque.NroOpSap.HasValue ? embarque.NroOpSap.Value.ToString() : "",
						IM_IMO = vaporInformacion?.ImoVapor ?? "",
						IM_WERKS = "PSB",
						IM_FECHA_ETA = embarque.FechaRecalada != null ? Convert.ToDateTime(embarque.FechaRecalada).ToString("yyyy-MM-dd") : "",
						IM_CARPETA_BSAS = embarque.NroOpSap.HasValue ? embarque.NroOpSap.Value.ToString() : "",
						IM_CARPETA_PTO = embarque.NroOpSap.HasValue ? embarque.NroOpSap.Value.ToString() : "",
						IM_AGENCIA = embarque.Agencias?.CodigoSap ?? "",
						IM_FECHA_ALTA = operacionCabecera == "A" ? DateTime.Now.ToString("yyyy-MM-dd") : "",
						IM_USUARIO_ALTA = operacionCabecera == "A" ? "GWEBSRV_SCA" : "",
						IM_FECHA_MOD = operacionCabecera == "M" ? DateTime.Now.ToString("yyyy-MM-dd") : "",
						IM_USUARIO_MOD = operacionCabecera == "M" ? "GWEBSRV_SCA" : "",
						IM_CARGADISP = Math.Round(totalKilogramos, 0),
						IM_UNMED = "KG",
						IM_DETALLES = listaDetallesSap.ToArray(),
						IM_OPERATIVO = "X",
						IM_FECHA_OP = "",
						IM_CIERRE_OP = "X",
						IM_FECHA_CIERRE_OP = fechaCierreOp
					}
				};

				transaccion.PayloadXML = XmlConverter<Z_SDMF_RFC_ABM_OP_DETALLESRequest>.Serialize(requestSap);

				var response = _servicioSap.Z_SDMF_RFC_ABM_OP_DETALLES(requestSap);

				string responseXml = XmlConverter<Z_SDMF_RFC_ABM_OP_DETALLESResponse1>.Serialize(response);
				mensajeFrontend = response.Z_SDMF_RFC_ABM_OP_DETALLESResponse.EX_MESSAGE;

				if (response.Z_SDMF_RFC_ABM_OP_DETALLESResponse.EX_RESPONSE == "OK" ||
				   (mensajeFrontend != null && mensajeFrontend.Contains("Número de operación ya existente")))
				{
					transaccion.Estado = "Enviado";
					transaccion.ResponseSAP = responseXml;
				}
				else
				{
					transaccion.Estado = "Error";
					transaccion.ResponseSAP = responseXml;
				}

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

		private void ProcesarAltasYModificacionesDetalles(List<CargaFisicaEmbarqueItemSAP> cargasFisicas,
			List<TransaccionesSAPDetallesEmbarque> detallesPrevios, string operacionCabecera, int idContratoFAS,
			string coordinadorSap, ref long valorNroNomFAS, Dictionary<int, int> variacionesPorNominacion,
			List<ZFIES1450> listaDetallesSap, TransaccionesSAP transaccion)
		{
			foreach (var carga in cargasFisicas)
			{
				string operacionItem = "A";
				string nronomSap = "";

				var previo = detallesPrevios.FirstOrDefault(d =>
					d.OperacionItem != "B" &&
					d.NominacionId == carga.NominacionId &&
					d.ExportadorSap == carga.ExportadorSap &&
					d.MaterialSap == carga.MaterialSap &&
					d.DestinoSap == carga.DestinoSap);

				if (previo != null)
				{
					operacionItem = "M";
					nronomSap = previo.NroNom_SAP;
				}
				else
				{
					operacionItem = "A";

					if (carga.TipoDeContratoId == idContratoFAS)
					{
						valorNroNomFAS++;
						nronomSap = valorNroNomFAS.ToString();
					}
					else
					{
						if (!variacionesPorNominacion.ContainsKey(carga.NominacionId))
							variacionesPorNominacion[carga.NominacionId] = -1;

						variacionesPorNominacion[carga.NominacionId]++;
						string prefix = variacionesPorNominacion[carga.NominacionId].ToString("D2");

						nronomSap = "20" + prefix + carga.NominacionId.ToString().PadLeft(6, '0');
					}
				}

				string flagDefinitivo = (operacionCabecera == "A") ? "A" : operacionItem;

				listaDetallesSap.Add(new ZFIES1450
				{
					FLAG = flagDefinitivo,
					NRONOM = nronomSap,
					PAISDEST = carga.DestinoSap ?? "",
					CLIENTE = "",
					EXPORTADOR = carga.ExportadorSap ?? "",
					MATNR = !string.IsNullOrEmpty(carga.MaterialSap) ? carga.MaterialSap.PadLeft(18, '0') : "",
					CANT = Math.Round(carga.Cantidad, 0),
					UNMED = "KG",
					PERMISO = "",
					VENCIMIENTO = "",
					PUERTO = "",
					COORDINADOR = coordinadorSap
				});

				transaccion.DetallesEmbarque.Add(new TransaccionesSAPDetallesEmbarque
				{
					TransaccionesSAP_Id = transaccion.Id,
					NominacionId = carga.NominacionId,
					NroNom_SAP = nronomSap,
					TipoDeContratoId = carga.TipoDeContratoId,
					ExportadorSap = carga.ExportadorSap,
					MaterialSap = carga.MaterialSap,
					DestinoSap = carga.DestinoSap,
					Cantidad = carga.Cantidad,
					OperacionItem = flagDefinitivo
				});
			}
		}

		private void ProcesarBajasDetalles(List<TransaccionesSAPDetallesEmbarque> detallesPrevios,
			List<CargaFisicaEmbarqueItemSAP> cargasFisicas, List<ZFIES1450> listaDetallesSap, TransaccionesSAP transaccion)
		{
			var previosActivos = detallesPrevios.Where(d => d.OperacionItem != "B").ToList();

			foreach (var previo in previosActivos)
			{
				bool existeActualmente = cargasFisicas.Any(c =>
					c.NominacionId == previo.NominacionId && c.ExportadorSap == previo.ExportadorSap &&
					c.MaterialSap == previo.MaterialSap && c.DestinoSap == previo.DestinoSap);

				if (!existeActualmente)
				{
					listaDetallesSap.Add(new ZFIES1450
					{
						FLAG = "B",
						NRONOM = previo.NroNom_SAP,
						PAISDEST = "",
						CLIENTE = "",
						EXPORTADOR = "",
						MATNR = "",
						CANT = 0,
						UNMED = "",
						PERMISO = "",
						VENCIMIENTO = "",
						PUERTO = "",
						COORDINADOR = ""
					});

					transaccion.DetallesEmbarque.Add(new TransaccionesSAPDetallesEmbarque
					{
						TransaccionesSAP_Id = transaccion.Id,
						NominacionId = previo.NominacionId,
						NroNom_SAP = previo.NroNom_SAP,
						TipoDeContratoId = previo.TipoDeContratoId,
						ExportadorSap = previo.ExportadorSap,
						MaterialSap = previo.MaterialSap,
						DestinoSap = previo.DestinoSap,
						Cantidad = 0,
						OperacionItem = "B"
					});
				}
			}
		}
	}
}