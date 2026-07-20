using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.SAP;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
	[BasicAuthFilter]
	public class OperacionesPuertoController : BaseController
	{
		private readonly IServicioComandos servicioComandos;

		public OperacionesPuertoController(
			IServicioRepositorio servicio,
			IServicioComandos servicioComandos)
			: base(servicio)
		{
			this.servicioComandos = servicioComandos;
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ListarCargas")]
		public HttpResponseMessage ListarCargas([FromUri] CargaFiltroDto filtro, int pagina = 1, string ordenarPor = "Fecha", DirOrden dirOrden = DirOrden.Asc, int itemsPorPagina = 10)
		{
			try
			{
				ordenarPor = ordenarPor == "Estado" ? "CargaOpuesta_Id" : ordenarPor;

				var paginacion = new Paginacion(ordenarPor, dirOrden, pagina, itemsPorPagina);
				var resultado = servicio.ListarPaginadoCargas(filtro, paginacion);

				var cargas = resultado.Items.ToList();
				AsignarEstadoACargas(cargas);

				return Request.CreateResponse(HttpStatusCode.OK, new
				{
					Items = cargas,
					ItemsTotales = resultado.ItemsTotales,
					Pagina = resultado.Pagina,
					ItemsPorPagina = resultado.ItemsPorPagina
				});
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ListarBalanzadas")]
		public HttpResponseMessage ListarBalanzadas(int id, string numeroBalanza, int? idFin = null, bool? enviado = null, int pagina = 1, string ordenarPor = "Id", DirOrden dirOrden = DirOrden.Asc, int itemsPorPagina = 10)
		{
			var paginacion = new Paginacion(ordenarPor, dirOrden, pagina, itemsPorPagina);
			var resultado = servicio.ListarPaginadoBalanzadas(id, idFin, numeroBalanza, enviado, paginacion);
			return Request.CreateResponse(HttpStatusCode.OK, new
			{
				Items = resultado.Items,
				ItemsTotales = resultado.ItemsTotales,
				Pagina = resultado.Pagina,
				ItemsPorPagina = resultado.ItemsPorPagina
			});
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ObtenerCarga")]
		public HttpResponseMessage ObtenerCarga(int id, string numeroBalanza)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerCarga(id, numeroBalanza));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/TotalEmbarcado")]
		public HttpResponseMessage TotalEmbarcado(int cargaInicialId, string cargaInicialNumeroBalanza)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.TotalEmbarcado(cargaInicialId, cargaInicialNumeroBalanza));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/BalanzadasFaltantes")]
		public HttpResponseMessage BalanzadasFaltantes(int id, int idFin, string numeroBalanza)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarBalanzadasFaltantesPorRango(id, idFin, numeroBalanza));
		}

		[HttpPost]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/EnviarASap")]
		public HttpResponseMessage EnviarASap([FromBody] BalanzadaEnvioSapDto dto)
		{
			try
			{
				var comando = new EnviarLecturaBalanzadaTransmisionASap
				{
					Id = dto.Id,
					NumeroBalanza = dto.NumeroBalanza,
					Usuario = dto.Usuario
				};

				var resultado = servicioComandos.Ejecutar(comando);
				if (resultado.HayErrores)
				{
					return Request.CreateResponse(HttpStatusCode.BadRequest, resultado.Errores);
				}

				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPost]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/EnviarASapLote")]
		public HttpResponseMessage EnviarASapLote(int cargaId, string numeroBalanza, string usuario)
		{
			try
			{
				var balanzadas = servicio.ObtenerBalanzadasParaEnviarASAP(cargaId, numeroBalanza);
				var errores = new List<string>();
				foreach (var balanzada in balanzadas)
				{
					try
					{
						servicioComandos.Ejecutar(new EnviarLecturaBalanzadaTransmisionASap
						{
							Id = balanzada.Id,
							NumeroBalanza = balanzada.NumeroBalanza,
							Usuario = usuario
						});
					}
					catch (Exception ex)
					{
						errores.Add($"Balanzada {balanzada.Id}: {ex.Message}");
					}
				}
				if (errores.Any())
					return Request.CreateResponse(HttpStatusCode.PartialContent, errores);
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPost]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/CrearCarga")]
		public HttpResponseMessage CrearCarga([FromBody] CargaDto dto)
		{
			try
			{
				var resultado = (ResultadoCrear)servicioComandos.Ejecutar(new CrearCarga { Dto = dto });
				if (resultado.HayErrores)
					return Request.CreateResponse(HttpStatusCode.BadRequest, resultado.Errores);
				return Request.CreateResponse(HttpStatusCode.OK, new { Id = resultado.Id });
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPut]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ModificarCarga")]
		public HttpResponseMessage ModificarCarga([FromBody] CargaDto dto)
		{
			try
			{
				var resultado = servicioComandos.Ejecutar(new ModificarCarga { Dto = dto });
				if (resultado.HayErrores)
					return Request.CreateResponse(HttpStatusCode.BadRequest, resultado.Errores);
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPost]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/CrearBalanzada")]
		public HttpResponseMessage CrearBalanzada([FromBody] BalanzadaDto dto)
		{
			try
			{
				var resultado = (ResultadoCrear)servicioComandos.Ejecutar(new CrearBalanzada { Dto = dto });
				if (resultado.HayErrores)
					return Request.CreateResponse(HttpStatusCode.BadRequest, resultado.Errores);
				return Request.CreateResponse(HttpStatusCode.OK, new { Id = resultado.Id });
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpPut]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ModificarBalanzada")]
		public HttpResponseMessage ModificarBalanzada([FromBody] BalanzadaDto dto)
		{
			try
			{
				var resultado = servicioComandos.Ejecutar(new ModificarBalanzada { Dto = dto });
				if (resultado.HayErrores)
					return Request.CreateResponse(HttpStatusCode.BadRequest, resultado.Errores);
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpDelete]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/EliminarBalanzada/{id}")]
		public HttpResponseMessage EliminarBalanzada(int id)
		{
			try
			{
				var resultado = servicioComandos.Ejecutar(new EliminarBalanzada { Id = id });
				if (resultado.HayErrores)
					return Request.CreateResponse(HttpStatusCode.BadRequest, resultado.Errores);
				return Request.CreateResponse(HttpStatusCode.OK);
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ObtenerBalanzada")]
		public HttpResponseMessage ObtenerBalanzada(int id, string numeroBalanza)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerBalanzada(id, numeroBalanza));
		}

		[HttpPost]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/CrearEmbarqueLiquido")]
		public HttpResponseMessage CrearEmbarqueLiquido([FromBody] EmbarqueLiquidosDto model)
		{
			try
			{
				var resultado = (ResultadoCrear)servicioComandos.Ejecutar(new CrearCarga { Dto = TransformarEmbarqueDtoEnCargaInicioDto(model) });
				if (resultado.HayErrores)
					return Request.CreateResponse(HttpStatusCode.BadRequest, resultado.Errores);

				int cargaInicialId = resultado.Id;
				resultado = (ResultadoCrear)servicioComandos.Ejecutar(new CrearBalanzada { Dto = TransformarEmbarqueDtoEnBalanzada(model, cargaInicialId) });
				if (resultado.HayErrores)
					return Request.CreateResponse(HttpStatusCode.BadRequest, resultado.Errores);

				int balanzadaId = resultado.Id;
				resultado = (ResultadoCrear)servicioComandos.Ejecutar(new CrearCarga { Dto = TransformarEmbarqueDtoEnCargaFinDto(model, cargaInicialId, balanzadaId) });
				if (resultado.HayErrores)
					return Request.CreateResponse(HttpStatusCode.BadRequest, resultado.Errores);

				int cargaFinId = resultado.Id;
				var resultadoActualizar = servicioComandos.Ejecutar(new ActualizarCargaOpuesta
				{
					Carga_Id = cargaInicialId,
					CargaOpuesta_Id = cargaFinId,
					NumeroBalanza = model.NumeroBalanza
				});
				if (resultadoActualizar.HayErrores)
					return Request.CreateResponse(HttpStatusCode.BadRequest, resultadoActualizar.Errores);

				try
				{
					servicioComandos.Ejecutar(new EnviarLecturaBalanzadaTransmisionASap
					{
						Id = balanzadaId,
						NumeroBalanza = model.NumeroBalanza,
						Usuario = nombreUsuario
					});
				}
				catch (Exception exSap)
				{
					return Request.CreateResponse(HttpStatusCode.OK, new
					{
						CargaInicialId = cargaInicialId,
						CargaFinId = cargaFinId,
						BalanzadaId = balanzadaId,
						Advertencia = "Se creó el embarque. Falló el envío a SAP de la balanzada. " + exSap.Message
					});
				}

				return Request.CreateResponse(HttpStatusCode.OK, new
				{
					CargaInicialId = cargaInicialId,
					CargaFinId = cargaFinId,
					BalanzadaId = balanzadaId
				});
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/TodoEnviado")]
		public HttpResponseMessage TodoEnviado(int id, int? idFin, string numeroBalanza)
		{
			var paginacion = new Paginacion("Id", DirOrden.Asc, 1);
			var lista = servicio.ListarPaginadoBalanzadas(id, idFin, numeroBalanza, false, paginacion);
			return Request.CreateResponse(HttpStatusCode.OK, new { TodoEnviado = lista.ItemsTotales == 0 });
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ListarExportadores")]
		public HttpResponseMessage ListarExportadores()
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ListaExportadores());
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ListarMateriales")]
		public HttpResponseMessage ListarMateriales()
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ListaMaterialesPuerto());
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ListarBalanzasPuerto")]
		public HttpResponseMessage ListarBalanzasPuerto()
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarBalanzasPuertoReales());
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/ListarBalanzasAdministrativas")]
		public HttpResponseMessage ListarBalanzasAdministrativas()
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerTodasBalanzaPuertoAdministrativa());
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/BuscarVapor")]
		public HttpResponseMessage BuscarVapor(string criteria)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.BuscarVapor(criteria));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/BuscarVapores")]
		public HttpResponseMessage BuscarVapores(string criteria)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.BuscarVapores(criteria));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/BuscarBodega")]
		public HttpResponseMessage BuscarBodega(string criteria)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.BuscarBodega(criteria));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/BuscarBodegas")]
		public HttpResponseMessage BuscarBodegas(string criteria)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.BuscarBodegas(criteria));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/BuscarExportador")]
		public HttpResponseMessage BuscarExportador(string criteria)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.BuscarExportador(criteria));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/BuscarExportadores")]
		public HttpResponseMessage BuscarExportadores(string criteria)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.BuscarExportadores(criteria));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/BuscarDestino")]
		public HttpResponseMessage BuscarDestino(string criteria)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.BuscarDestino(criteria));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/BuscarDestinos")]
		public HttpResponseMessage BuscarDestinos(string criteria)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.BuscarDestinos(criteria));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/BuscarMaterialPuerto")]
		public HttpResponseMessage BuscarMaterialPuerto(string criteria)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.BuscarMaterialPuerto(criteria));
		}

		[HttpGet]
		[Autorizacion(PermisosScato.Embarques_Ver)]
		[Route("api/OperacionesPuerto/BuscarMaterialesPuerto")]
		public HttpResponseMessage BuscarMaterialesPuerto(string criteria)
		{
			return Request.CreateResponse(HttpStatusCode.OK, servicio.BuscarMaterialesPuerto(criteria));
		}

		[HttpPost]
		[AllowAnonymous]
		[Route("api/OperacionesPuerto/RestaurarBalanzadasPerdidas")]
		public HttpResponseMessage RestaurarBalanzadasPerdidas(string numeroBalanza, int desde, int hasta)
		{
			try
			{
				servicioComandos.Ejecutar(new RestaurarBalanzadasPerdidas { NumeroBalanza = numeroBalanza, Desde = desde, Hasta = hasta });
				return Request.CreateResponse(HttpStatusCode.OK, "OK");
			}
			catch (Exception e)
			{
				return Request.CreateResponse(HttpStatusCode.InternalServerError, e.Message);
			}
		}

		#region Metodos privados

		private CargaDto TransformarEmbarqueDtoEnCargaInicioDto(EmbarqueLiquidosDto dto)
		{
			return new CargaDto
			{
				Id = servicio.ObtenerProximoIdEmbarqueLiquido(dto.NumeroBalanza),
				Bodega = dto.Bodega,
				BodegaId = dto.BodegaId,
				Destino = dto.Destino,
				DestinoId = dto.DestinoId,
				EnviadoASap = false,
				Exportador = dto.Exportador,
				ExportadorId = dto.ExportadorId,
				Fecha = dto.Fecha,
				Material = dto.Material,
				MaterialId = dto.MaterialId,
				NumeroBalanza = dto.NumeroBalanza,
				PesoProgramado = dto.Peso,
				Tipo = "inicio",
				ToneladasAW = 0,
				Vapor = dto.Vapor,
				VaporId = dto.VaporId
			};
		}

		private CargaDto TransformarEmbarqueDtoEnCargaFinDto(EmbarqueLiquidosDto dto, int cargaOpuestaId, int balanzadaId)
		{
			var inicio = servicio.ObtenerCarga(cargaOpuestaId, dto.NumeroBalanza);
			return new CargaDto
			{
				Id = balanzadaId + 1,
				Bodega = dto.Bodega,
				BodegaId = inicio != null ? inicio.BodegaId : dto.BodegaId,
				Destino = dto.Destino,
				DestinoId = inicio != null ? inicio.DestinoId : dto.DestinoId,
				EnviadoASap = false,
				Exportador = dto.Exportador,
				ExportadorId = inicio != null ? inicio.ExportadorId : dto.ExportadorId,
				Fecha = dto.Fecha.AddMinutes(5),
				Material = dto.Material,
				MaterialId = inicio != null ? inicio.MaterialId : dto.MaterialId,
				NumeroBalanza = dto.NumeroBalanza,
				PesoProgramado = dto.Peso,
				Tipo = "fin",
				ToneladasAW = dto.Peso,
				Vapor = dto.Vapor,
				VaporId = inicio != null ? inicio.VaporId : dto.VaporId,
				FechaInicio = dto.Fecha,
				CargaOpuesta_Id = cargaOpuestaId,
				CargaOpuesta_NumeroBalanza = dto.NumeroBalanza
			};
		}

		private BalanzadaDto TransformarEmbarqueDtoEnBalanzada(EmbarqueLiquidosDto dto, int cargaId)
		{
			return new BalanzadaDto
			{
				Id = cargaId + 1,
				Capacidad = "0",
				CargaInicial_Id = cargaId,
				CargaInicial_NumeroBalanza = dto.NumeroBalanza,
				EnviadoASap = false,
				Fecha = dto.Fecha.AddMinutes(2),
				NumeroBalanza = dto.NumeroBalanza,
				PesoBruto = dto.Peso,
				PesoNeto = dto.Peso,
				PesoTara = 0
			};
		}

		private void AsignarEstadoACargas(List<CargaDto> cargas)
		{
			foreach (CargaDto carga in cargas)
			{
				if (carga.CargaOpuesta_Id == null)
				{
					if (carga.Tipo == "fin")
					{
						carga.PorcentajeDeCarga = 0;
						carga.IdFin = carga.Id;
						carga.Error = 2; // Falta Inicio
					}
					else
					{
						carga.PorcentajeDeCarga = ObtenerPorcentajeDeCarga(carga);
						carga.Error = 1; // En Progreso
					}
				}
				else
				{
					carga.IdFin = carga.CargaOpuesta_Id;
					carga.FechaInicio = carga.Fecha;
					CompararPesoCargaBalanzadas(carga);
				}
			}
		}

		private int ObtenerPorcentajeDeCarga(CargaDto carga)
		{
			return carga.PesoProgramado != 0 ? servicio.TotalEmbarcado(carga.Id, carga.NumeroBalanza) * 100 / carga.PesoProgramado : 0;
		}

		private void CompararPesoCargaBalanzadas(CargaDto carga)
		{
			CargaDto cargaOpuesta = servicio.ObtenerCarga(carga.CargaOpuesta_Id.Value, carga.NumeroBalanza);
			if (cargaOpuesta != null)
			{
				carga.ToneladasAW = cargaOpuesta.ToneladasAW;
				int totalEmbarcado = servicio.TotalEmbarcado(carga.Id, carga.NumeroBalanza);

				if (totalEmbarcado < cargaOpuesta.ToneladasAW)
				{
					carga.Error = 3; // Falta Peso
					carga.ErrorMensaje = string.Format(Molinos.Scato.Dominio.Recursos.Textos.Error_PesoFaltante, totalEmbarcado, cargaOpuesta.ToneladasAW);
				}
				else if (totalEmbarcado > cargaOpuesta.ToneladasAW)
				{
					carga.Error = 4; // Diferencia de peso AW
					carga.ErrorMensaje = string.Format(Molinos.Scato.Dominio.Recursos.Textos.Error_PesoFaltante, totalEmbarcado, cargaOpuesta.ToneladasAW);
				}

				var balanzadasFaltantes = servicio.ListarBalanzadasFaltantesPorRango(carga.Id, carga.CargaOpuesta_Id.Value, carga.NumeroBalanza).ToList();
				if (balanzadasFaltantes.Count != 0)
				{
					carga.Error = 6; // Faltan Balanzadas
					carga.ErrorMensaje = Molinos.Scato.Dominio.Recursos.Textos.OperacionesPuerto_BalanzadasFaltantes + " " + string.Join(",", balanzadasFaltantes);
				}

				// Comparacion de consistencia entre inicio y fin
				if (carga.VaporId != cargaOpuesta.VaporId || carga.ExportadorId != cargaOpuesta.ExportadorId)
				{
					carga.Error = 5;
				}
			}
		}

		#endregion
	}
}
