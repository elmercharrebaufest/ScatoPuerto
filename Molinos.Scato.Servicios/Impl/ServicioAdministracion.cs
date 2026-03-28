using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Entidades.Administracion;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Molinos.Scato.Servicios.Impl
{
	public class ServicioAdministracion : IServicioAdministracion
	{
		private readonly IRepositorio _repositorio;
		private readonly IConversor _conversor;
		private readonly ILogger _log;
		private readonly IServicioComandos _servicioComandos;
		private readonly IServicioRepositorio _servicioRepositorio;

		public ServicioAdministracion(
			IRepositorio repositorio,
			IConversor conversor,
			ILogger log,
			IServicioComandos comandos,
			IServicioRepositorio servicioRepositorio
		)
		{
			_repositorio = repositorio;
			_conversor = conversor;
			_log = log;
			_servicioComandos = comandos;
			_servicioRepositorio = servicioRepositorio;
		}

		#region Metodos Utiles

		public IList<TDto> Listar<TEntidad, TDto>() where TEntidad : class
		{
			return _conversor.ConvertirList<TEntidad, TDto>(_repositorio.Listar<TEntidad>());
		}

		private IList<TDto> Listar<TEntidad, TDto>(Expression<Func<TEntidad, bool>> expresionFiltro) where TEntidad : class
		{
			return _conversor.ConvertirList<TEntidad, TDto>(_repositorio.Listar(expresionFiltro));
		}

		private TDto Obtener<TEntidad, TDto>(int id) where TEntidad : class
		{
			return _conversor.Convertir<TEntidad, TDto>(_repositorio.Obtener<TEntidad>(id));
		}

		private TDto Obtener<TEntidad, TDto>(Expression<Func<TEntidad, bool>> expresionFiltro) where TEntidad : class
		{
			return _conversor.Convertir<TEntidad, TDto>(_repositorio.Obtener(expresionFiltro));
		}

		#endregion Metodos Utiles

		public CombosConsultaEmbarquesDto ObtenerCombos()
		{
			var response = new CombosConsultaEmbarquesDto
			{
				Buques = _servicioRepositorio.ObtenerVaporesUsados().ToList(),
				Muelles = _servicioRepositorio.ListarMuelles().ToList(),
				Agencias = _servicioRepositorio.ListarAgenciasMaritimas().ToList(),
				Exportadores = _servicioRepositorio.ListaExportadores().ToList(),
				Clientes = _servicioRepositorio.ListarCoordinadores().ToList(),
				Productos = _servicioRepositorio.ListaMaterialesPuerto().ToList()
			};
			return response;
		}

		public ListaPaginada<InformacionEmbarqueDto> ListarEmbarquesAdministracion(Paginacion paginacion,
			FiltrosAdministracionDto filtros = null)
		{
			var consulta = CrearConsultaEmbarquesAdministracion(paginacion, filtros);
			var resultado = _repositorio.ListarConsultaPaginada(consulta);

			foreach (var item in resultado.Items)
			{
				var admEmbarque = _repositorio.Obtener<AdministracionEmbarque>(e => e.Embarque.Id == item.IdEmbarque);
				if (admEmbarque?.EstadoEmbarque != null)
				{
					var estadoDesc = admEmbarque.EstadoEmbarque.Descripcion;
					if (estadoDesc == "Aplicado" || estadoDesc == "Facturado")
					{
						item.Estado = estadoDesc.ToUpper();
					}
				}
			}

			return resultado;
		}

		public List<InformacionEmbarqueDto> ListarEmbarquesAdministracionSinPaginar(
			FiltrosAdministracionDto filtros)
		{
			var paginacion = new Paginacion();
			var consulta = CrearConsultaEmbarquesAdministracion(paginacion, filtros);
			var listaPaginada = _repositorio.ListarConsultaPaginada(consulta);
			return listaPaginada.Items.ToList();
		}

		private ListarEmbarquesAdministracionConsulta CrearConsultaEmbarquesAdministracion(Paginacion paginacion,
			FiltrosAdministracionDto filtros)
		{
			List<string> listaBuques = filtros.Buques != null && filtros.Buques.Any() ? filtros.Buques.Select(x => x.Nombre).ToList() : new List<string>();
			List<string> listaMuelles = filtros.Muelles != null && filtros.Muelles.Any() ? filtros.Muelles.Select(x => x.Descripcion).ToList() : new List<string>();
			List<string> listaExportadores = filtros.Exportadores != null && filtros.Exportadores.Any() ? filtros.Exportadores.Select(x => x.Nombre).ToList() : new List<string>();
			List<string> listaMateriales = filtros.Materiales != null && filtros.Materiales.Any() ? filtros.Materiales.Select(x => x.Descripcion).ToList() : new List<string>();
			List<string> listaEstados;

			filtros.Tanques = string.IsNullOrEmpty(filtros.Tanques) || filtros.Tanques == "TODOS" ? null : filtros.Tanques;
			if (string.IsNullOrEmpty(filtros.Estados) || filtros.Estados == "TODOS")
			{
				listaEstados = null;
			}
			else if (filtros.Estados == "SIN FACTURAR")
			{
				listaEstados = new List<string> { "EN OPERACIONES", "EN CALIDAD", "EN RECIBIDORES", "A FACTURAR" };
			}
			else
			{
				listaEstados = new List<string> { "FACTURADO" };
			}

			return new ListarEmbarquesAdministracionConsulta(paginacion, filtros.Desamarre, listaBuques, listaMuelles, filtros.Tanques, listaExportadores, listaMateriales, listaEstados);
		}

		public DetalleEmbarqueAFacturarDto ObtenerDetalleEmbarque(int embarqueId)
		{
			var lineup = _repositorio.Obtener<LineUp>(l => l.Embarque.Id == embarqueId);
			var estado = DeterminarEstado(lineup);
			var estadoBd = _repositorio.Obtener<EstadoEmbarque>(e => e.Descripcion.ToLower() == estado.ToLower());
			var administracionEmbarqueBd = _repositorio.Obtener<AdministracionEmbarque>(admEmbarque => admEmbarque.Embarque.Id == embarqueId);

			var nominaciones = ObtenerNominaciones(embarqueId);
			var exportadoresNominacion = ObtenerExportadoresNominacion(nominaciones, lineup);
			var agenciasNominacion = ObtenerAgenciasNominacion(nominaciones);
			var clientesNominacion = ObtenerClientesNominacion(nominaciones);
			var destinosNominacion = ObtenerDestinosNominacion(nominaciones);
			var surveyors = ObtenerSurveyorNominacion(nominaciones);
			var ata = ObtenerATANominacion(nominaciones);

			var amarreNominacion = nominaciones.FirstOrDefault()?.NominacionDatoTecnico.ETARecalada;
			var obligCarga = ObtenerFechaObligCargaNominacion(nominaciones);
			var estimadoTribado = nominaciones.Any(x => x.NominacionDetalleIntervencion != null && x.NominacionDetalleIntervencion.EstibadorYTrimado == true);
			var administracionEmbarque = _conversor.Convertir<AdministracionEmbarque, AdministracionEmbarqueDto>(administracionEmbarqueBd);
			var muelle = DeterminarMuelle(lineup.Embarque);

			var cargas = ObtenerCargas(lineup);
			var infoBuque = ObtenerInformacionBuque(cargas, nominaciones, lineup.PlanoDeCarga);

			var tieneFumPrevNominacion = nominaciones.Any(x => x.NominacionDetalleIntervencion?.Fumigacion == "Si");

			if (estadoBd.Descripcion == "Lineup")
			{
				return CrearDtoLineup(embarqueId, lineup, estado, muelle, amarreNominacion, tieneFumPrevNominacion, exportadoresNominacion, agenciasNominacion, administracionEmbarque, infoBuque, nominaciones, clientesNominacion, destinosNominacion,
					obligCarga, surveyors, ata, estimadoTribado);
			}
			else
			{
				return CrearDtoCompleto(embarqueId, lineup, estado, muelle, nominaciones, amarreNominacion, exportadoresNominacion, agenciasNominacion, administracionEmbarque, infoBuque, clientesNominacion,
					destinosNominacion, obligCarga, surveyors, ata, estimadoTribado);
			}
		}

		private string DeterminarEstado(LineUp lineup)
		{
			var admEmbarque = _repositorio.Obtener<AdministracionEmbarque>(e => e.Embarque.Id == lineup.Embarque.Id);
			var estadoEmbarque = admEmbarque?.EstadoEmbarque;
			if (estadoEmbarque != null)
			{
				var descripcion = estadoEmbarque.Descripcion;
				if (descripcion == "Aplicado" || descripcion == "Facturado")
				{
					return descripcion;
				}
			}

			return lineup.Embarque.Ubicacion == 1 ? "A facturar" :
				   !lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos.Any() ? "LineUp" :
				   lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos.All(x => x.Cerrado) ? "Calidad" : "Operaciones";
		}

		private List<Nominacion> ObtenerNominaciones(int embarqueId)
		{
			var nominaciones = _repositorio.Listar<Nominacion>(n => n.Embarque.Id == embarqueId && n.FechaEliminacion == null).ToList();
			if (!nominaciones.Any())
			{
				nominaciones = _repositorio.Listar<NominacionEmbarque>(x => x.Embarque.Id == embarqueId && x.Nominacion.FechaEliminacion == null)
									   .Select(x => x.Nominacion).ToList();
			}
			return nominaciones;
		}

		private List<ExportadorDto> ObtenerExportadoresNominacion(List<Nominacion> nominaciones, LineUp lineup)
		{
			var exportadores = new List<ExportadorDto>();
			if (nominaciones.Select(n => n.NominacionDatoTecnico).All(y => !y.NominacionDatoTecnicoExportador.Any()) && lineup.PlanoDeCarga?.CargaComercial != null)
			{
				exportadores = lineup.PlanoDeCarga.CargaComercial.Select(c => c.Exportador).Select(x => new ExportadorDto
				{
					Id = x.Id,
					Nombre = x.Nombre,
					Habilitado = x.Habilitado
				}).ToList();
			}
			else
			{
				exportadores = _conversor.ConvertirList<Exportador, ExportadorDto>(
					nominaciones.SelectMany(x => x.NominacionDatoTecnico.NominacionDatoTecnicoExportador)
								.Select(e => e.Exportador)
								.ToList()).ToList();
			}
			return exportadores;
		}

		private List<AgenciaMaritimaPuertoDto> ObtenerAgenciasNominacion(List<Nominacion> nominaciones)
		{
			return _conversor.ConvertirList<AgenciaMaritimaPuerto, AgenciaMaritimaPuertoDto>(
				nominaciones.Select(x => x.NominacionDatoTecnico.AgenciaMaritimaPuerto).ToList()).GroupBy(a => a.Id)
				.Select(g => g.First()).ToList();
		}

		private List<CoordinadorPuertoDto> ObtenerClientesNominacion(List<Nominacion> nominaciones)
		{
			return _conversor.ConvertirList<CoordinadorPuerto, CoordinadorPuertoDto>(
				nominaciones.SelectMany(x => x.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto)
				.Select(x => x.CoordinadorPuerto).ToList()).GroupBy(a => a.Id)
				.Select(g => g.First()).ToList();
		}

		private List<DestinoDto> ObtenerDestinosNominacion(List<Nominacion> nominaciones)
		{
			return _conversor.ConvertirList<Destino, DestinoDto>(
				nominaciones.SelectMany(x => x.NominacionDatoTecnico.NominacionDatoTecnicoDestino)
				.Select(x => x.Destino).ToList()).ToList();
		}

		private string ObtenerSurveyorNominacion(List<Nominacion> nominaciones)
		{
			var surveyors = nominaciones.Where(s => s.NominacionDatoTecnico.Surveyor != null)
				.Select(x => x.NominacionDatoTecnico.Surveyor.Descripcion).ToList();
			return surveyors != null && surveyors.Any() ? string.Join(", ", surveyors) : "N/A";
		}

		private string ObtenerATANominacion(List<Nominacion> nominaciones)
		{
			var ata = nominaciones.Where(a => a.NominacionDatoTecnico.ATAPuerto != null)
				.Select(x => x.NominacionDatoTecnico.ATAPuerto.Nombre).ToList();
			return ata.Any() ? string.Join(", ", ata) : "N/A";
		}

		private string DeterminarMuelle(Embarque embarque)
		{
			return embarque.SanBenito ? "San Benito" :
				   embarque.Vicentin ? "Vicentin" :
				   embarque.Noryon ? "Nouryon" :
				   embarque.OtrosMuelles ? embarque.OtroMuelleNombre : "Otros Muelles";
		}

		private DateTime? ObtenerFechaObligCargaNominacion(List<Nominacion> nominaciones)
		{
			var menorFechaObligacionCarga = nominaciones
			.Where(n => n.NominacionDatoTecnico?.ObligacionDeCarga.HasValue == true)
			.Min(n => n.NominacionDatoTecnico.ObligacionDeCarga.Value);
			return menorFechaObligacionCarga;
		}

		private IEnumerable<object> ObtenerCargas(LineUp lineup)
		{
			return lineup.Embarque.EsLiquido
				? lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos
					.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido.Cast<object>())
				: lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos
					.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Cast<object>());
		}

		private DetalleEmbarqueAFacturarDto CrearDtoLineup(int embarqueId, LineUp lineup, string estado, string muelle, DateTime? amarreNominacion, bool tieneFumPrevNominacion, List<ExportadorDto> exportadoresNominacion,
			List<AgenciaMaritimaPuertoDto> agenciasNominacion, AdministracionEmbarqueDto administracionEmbarque, List<InformacionBuqueDto> infoBuque,
			List<Nominacion> nominaciones, List<CoordinadorPuertoDto> clientes, List<DestinoDto> destinosNominacion, DateTime? obligCarga, string surveyor, string ata, bool estimadoTribado)
		{
			return new DetalleEmbarqueAFacturarDto
			{
				IdEmbarque = embarqueId,
				EsLiq = lineup.Embarque.EsLiquido,
				NroOp = lineup.Embarque.NroOpSap ?? 0,
				VaporInfoId = nominaciones.First().NominacionDatoTecnico.VaporInformacion?.Id ?? 0,
				Estado = administracionEmbarque?.EstadoEmbarque.Descripcion ?? estado,
				Buque = lineup.Embarque.Patente,
				Muelle = muelle,
				Amarre = amarreNominacion,
				HoraAmarre = null,
				Desamarre = null,
				HoraDesamarre = null,
				Senasa = nominaciones.Any(x => x.NominacionDetalleIntervencion?.Senasa?.Any(s => s.TieneSenasa) == true),
				DefMoviles = false,
				FumigacionPrev = tieneFumPrevNominacion,
				FumigacionCur = false,
				UsoPala = false,
				Exportadores = exportadoresNominacion,
				Agencias = agenciasNominacion,
				Clientes = clientes,
				Destinos = destinosNominacion,
				AdministracionEmbarque = administracionEmbarque,
				Cargas = infoBuque,
				ObligacionCarga = obligCarga.Value,
				Surveyor = surveyor,
				Ata = ata,
				EstibadoTrimado = estimadoTribado,
				Trn = nominaciones.First().NominacionDatoTecnico.VaporInformacion.PorteNeto,
				PuedeAsociarAcuerdos = EmbarquePuedeAsociarAcuerdos(lineup.Embarque, exportadoresNominacion),
				FechaLineUp = nominaciones.FirstOrDefault()?.FechaEnvioLineUp ?? null,
				FechaOperaciones = lineup.PlanoDeCarga?.FechaDeCreacion ?? null,
				FechaCalidad = lineup.ModuloDeCarga?.FechaDeCreacion ?? null,
				FechaZarpado = lineup.ModuloDeCarga?.FechaZarpado ?? null,
				FechaAplicado = administracionEmbarque?.FechaAplicado ?? null,
				FechaFacturado = administracionEmbarque?.FechaFacturado ?? null,
			};
		}

		private DetalleEmbarqueAFacturarDto CrearDtoCompleto(int embarqueId, LineUp lineup, string estado, string muelle, List<Nominacion> nominaciones,
			DateTime? amarreNominacion, List<ExportadorDto> exportadoresNominacion, List<AgenciaMaritimaPuertoDto> agenciasNominacion,
			AdministracionEmbarqueDto administracionEmbarque, List<InformacionBuqueDto> infoBuque, List<CoordinadorPuertoDto> clientes,
			List<DestinoDto> destinosNominacion, DateTime? obligCarga, string surveyor, string ata, bool estimadoTribado)
		{
			var periodoDeCarga = lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.FirstOrDefault();
			var amarre = periodoDeCarga?.FechaAmarro ?? amarreNominacion;
			var desamarre = periodoDeCarga?.FechaDesamarro;
			var horaAmarre = periodoDeCarga?.HoraAmarro ?? amarreNominacion?.ToString("HH:mm");
			var horaDesamarre = periodoDeCarga?.HoraDesamarro ?? "";
			var usoPala = lineup.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos?.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad).Any() ?? false;

			var tieneFumPrev = lineup.Embarque.EsLiquido
				? false
				: (lineup.PlanoDeCarga?.PlanoDeCargaBodega?.Any(x => x.FumPreventiva == true) ?? false);
			var tieneFumCur = lineup.Embarque.EsLiquido
				? false
				: (lineup.PlanoDeCarga?.PlanoDeCargaBodega?.Any(x => x.FumCurativa == true) ?? false);

			return new DetalleEmbarqueAFacturarDto
			{
				IdEmbarque = embarqueId,
				EsLiq = lineup.Embarque.EsLiquido,
				Estado = administracionEmbarque?.EstadoEmbarque.Descripcion ?? estado,
				Buque = lineup.Embarque.Patente,
				VaporInfoId = nominaciones.First().NominacionDatoTecnico.VaporInformacion?.Id ?? 0,
				Muelle = muelle,
				Amarre = amarre,
				HoraAmarre = horaAmarre,
				HoraDesamarre = horaDesamarre,
				Desamarre = desamarre,
				NroOp = lineup.Embarque.NroOpSap ?? 0,
				Senasa = nominaciones.Any(x => x.NominacionDetalleIntervencion?.Senasa?.Any(s => s.TieneSenasa) == true),
				DefMoviles = lineup.PlanoDeCarga?.DefensasMoviles ?? false,
				FumigacionPrev = lineup.PlanoDeCarga?.Fumigacion == true || tieneFumPrev,
				FumigacionCur = tieneFumCur,
				UsoPala = lineup.Embarque.EsLiquido ? false : usoPala,
				Exportadores = exportadoresNominacion,
				Agencias = agenciasNominacion,
				Clientes = clientes,
				Destinos = destinosNominacion,
				AdministracionEmbarque = administracionEmbarque,
				Cargas = infoBuque,
				ObligacionCarga = obligCarga,
				Surveyor = surveyor,
				Ata = ata,
				EstibadoTrimado = estimadoTribado,
				Trn = nominaciones.First().NominacionDatoTecnico.VaporInformacion.PorteNeto,
				PuedeAsociarAcuerdos = EmbarquePuedeAsociarAcuerdos(lineup.Embarque, exportadoresNominacion),
				FechaLineUp = nominaciones.FirstOrDefault()?.FechaEnvioLineUp ?? null,
				FechaOperaciones = lineup.PlanoDeCarga?.FechaDeCreacion ?? null,
				FechaCalidad = lineup.ModuloDeCarga?.FechaDeCreacion ?? null,
				FechaZarpado = lineup.ModuloDeCarga?.FechaZarpado ?? null,
				FechaAplicado = administracionEmbarque?.FechaAplicado ?? null,
				FechaFacturado = administracionEmbarque?.FechaFacturado ?? null,
			};
		}

		private bool EmbarquePuedeAsociarAcuerdos(Embarque embarque, List<ExportadorDto> exportadoresNominacion)
		{
			// Si el embarque aun no Zarpo entonces devuelvo que no puede asociar acuerdos
			if (embarque.Ubicacion != 1)
			{
				return false;
			}

			Func<ExportadorDto, bool> condicionDistintoDeMOA = x =>
				(x.Id != 77 || x.Nombre != "MOLINOS AGRO SA") && x.Habilitado;

			Func<ExportadorDto, bool> condicionEsMOA = x =>
				x.Id == 77 && x.Nombre == "MOLINOS AGRO SA" && x.Habilitado;

			var tieneAlgunExportadorDistintoDeMOA = exportadoresNominacion.Any(condicionDistintoDeMOA);
			var todosLosExportadoresSonMOA = exportadoresNominacion.All(condicionEsMOA);


			return (embarque.SanBenito && tieneAlgunExportadorDistintoDeMOA) ||
				   (!embarque.SanBenito && todosLosExportadoresSonMOA);
		}

		private List<InformacionBuqueDto> ObtenerInformacionBuque(IEnumerable<object> cargas, List<Nominacion> nominaciones, PlanoDeCarga plano)
		{
			var informacionBuqueList = new List<InformacionBuqueDto>();

			if (cargas.OfType<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>().Any())
			{
				var cargasLiquido = cargas.OfType<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>();
				var cargasLiquidoIds = cargasLiquido.Select(z => z.Linea_Id).ToList();
				var lineasLiquido = this._repositorio.Listar<ModuloDeCargaLineasDeEmbarque>(x => cargasLiquidoIds.Contains(x.Id));

				var agrupadoLiquido = cargasLiquido
					.GroupBy(c => new { c.Exportador, c.MaterialPuerto, c.Tk, TipoLineaEmbarque = lineasLiquido.FirstOrDefault(l => l.Id == c.Linea_Id)?.TipoLineaEmbarque })
					.Select(g => new
					{
						Exportador = g.Key.Exportador,
						MaterialPuerto = g.Key.MaterialPuerto,
						Tk = g.Key.Tk,
						TipoLineaEmbarque = g.Key.TipoLineaEmbarque,
						TotalCantidad = g.Sum(c => c.Cantidad)
					});

				foreach (var item in agrupadoLiquido)
				{
					var nominacion = nominaciones.FirstOrDefault(n => n.NominacionDatoTecnico.MaterialPuerto?.Id == item.MaterialPuerto.Id);
					var acuentaSenasa = nominacion?.NominacionDetalleIntervencion?.Senasa?.Any(s => s.Exportador.Id == item.Exportador.Id && s.TieneSenasa) == true ? "Si" + "(" +
						nominacion.NominacionDetalleIntervencion.Senasa.First(x => x.Exportador.Id == item.Exportador.Id).ACuentaDe + ")" : "No";
					var acuentaFumigacion = nominacion?.NominacionDetalleIntervencion?.Fumigacion == "Si" ? "Si(" + nominacion.NominacionDetalleIntervencion?.CompaniaACuentaDe + ")" : "No";
					var infoBuque = new InformacionBuqueDto
					{
						Exportador = item.Exportador.Nombre,
						MaterialPuerto = item.MaterialPuerto.Descripcion,
						NroTanque = item.Tk,
						TanqueOrigen = item.TipoLineaEmbarque.Linea,
						Tn = item.TotalCantidad,
						ACuentaFumigacion = acuentaFumigacion,
						ACuentaSenasa = acuentaSenasa
					};
					informacionBuqueList.Add(infoBuque);
				}
			}
			else if (cargas.OfType<ModuloDeCargaPlanillaDeTurnosDetallesSolido>().Any())
			{
				var cargasSolido = cargas.OfType<ModuloDeCargaPlanillaDeTurnosDetallesSolido>();
				var esIngresoManual = cargasSolido.First().ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.IngresoManualSolido;

				var agrupadoSolido = cargasSolido
					.GroupBy(c => new { c.Exportador, c.MaterialPuerto, c.Bodega, c.SiloCelda })
					.Select(g => new
					{
						Exportador = g.Key.Exportador,
						MaterialPuerto = g.Key.MaterialPuerto,
						Bodega = g.Key.Bodega,
						SiloCelda = g.Key.SiloCelda,
						TotalCantidad = g.Sum(c => (decimal)c.Cantidad / 1000)
					});

				foreach (var item in agrupadoSolido)
				{
					var nominacion = nominaciones.FirstOrDefault(n => n.NominacionDatoTecnico.MaterialPuerto?.Id == item.MaterialPuerto.Id);
					var acuentaSenasa = nominacion?.NominacionDetalleIntervencion?.Senasa?.Any(s => s.Exportador.Id == item.Exportador.Id && s.TieneSenasa) == true ? "Si" + "(" +
						nominacion.NominacionDetalleIntervencion.Senasa.First(x => x.Exportador.Id == item.Exportador.Id).ACuentaDe + ")" : "No";
					var acuentaFumigacion = nominacion?.NominacionDetalleIntervencion?.Fumigacion == "Si" ? "Si(" + nominacion.NominacionDetalleIntervencion?.CompaniaACuentaDe + ")" : "No";
					var infoBuque = new InformacionBuqueDto
					{
						Exportador = item.Exportador.Nombre,
						MaterialPuerto = item.MaterialPuerto.Descripcion,
						Bodega = int.Parse(item.Bodega.Nombre.Last().ToString()),
						SiloCelda = esIngresoManual ? item.SiloCelda?.Nombre : null,
						Tn = item.TotalCantidad,
						ACuentaSenasa = acuentaSenasa,
						ACuentaFumigacion = acuentaFumigacion
					};
					informacionBuqueList.Add(infoBuque);
				}
			}
			return informacionBuqueList;
		}

		public IList<NotificacionAdministracionDto> ObtenerNotificaciones()
		{
			return Listar<NotificacionAdministracion, NotificacionAdministracionDto>(n => n.FechaEliminacion == null);
		}

		public void EliminarNotificacion(int id, string usuario)
		{
			var notificacion = _repositorio.Obtener<NotificacionAdministracion>(id);
			notificacion.FechaEliminacion = DateTime.Now;
			notificacion.UsuarioEliminacion = usuario;
			_repositorio.GuardarCambios();
		}

		public AdministracionEnvioAlertaDto ObtenerDatosMailAlertaAdministracion()
		{
			var destinatarios = new List<string>();
			destinatarios = this._repositorio.Obtener<ConfiguracionMail>(x => x.TemplateMail == "AlertaAdministracion").Direcciones.Split(';').ToList();

			var copia = new List<string>();
			copia = this._repositorio.Obtener<ConfiguracionMail>(x => x.TemplateMail == "AlertaAdministracionCopia").Direcciones.Split(';').ToList();

			destinatarios.RemoveAll(item => item == null || item == "");
			copia.RemoveAll(item => item == null || item == "");

			var mail = new AdministracionEnvioAlertaDto
			{
				Destinatarios = destinatarios,
				Copia = copia,
			};
			return mail;
		}

		public void EnviarMailAlerta(MailDto mail)
		{
			try
			{
				mail.Copia = mail.Copia.Distinct().ToList();
				mail.Destinatarios = mail.Destinatarios.Distinct().ToList();
				mail.Copia.RemoveAll(item => item == null || item == "");
				mail.Destinatarios.RemoveAll(item => item == null || item == "");

				_servicioComandos.Ejecutar(new EnvioMail
				{
					Cuerpo = mail.Body.Replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;")
						   .Replace("\f\f", "</b>").Replace("\f", "<b>").Replace("\0\0", "</u>").Replace("\0", "<u>"),
					Destinatarios = mail.Destinatarios,
					Titulo = mail.Titulo,
					Copia = mail.Copia,
					AttachmentName = null,
				});
			}
			catch (Exception ex)
			{
				throw ex;
			}
		}

		public void EnviarCorreoAlertaAdministracion(AdministracionEnvioAlertaDto administracionEnvioAlerta)
		{
			administracionEnvioAlerta.Copia.RemoveAll(item => item == null || item == "");
			administracionEnvioAlerta.Destinatarios.RemoveAll(item => item == null || item == "");

			_servicioComandos.Ejecutar(new EnvioMail
			{
				Cuerpo = administracionEnvioAlerta.Comentario,
				Destinatarios = administracionEnvioAlerta.Destinatarios,
				Copia = administracionEnvioAlerta.Copia,
				Titulo = administracionEnvioAlerta.Asunto
			});
		}

		public IList<ConceptoDto> ListarConceptosProducto()
		{
			return Listar<Concepto, ConceptoDto>(c => c.PorProducto);
		}

		public IList<ConceptoDto> ListarConceptosEmbarque()
		{
			return Listar<Concepto, ConceptoDto>(c => c.PorEmbarque);
		}

		public IList<ConceptoDto> ListarConceptos()
		{
			return Listar<Concepto, ConceptoDto>();
		}

		public TarifaPorProductoDto ObtenerTarifaProducto(int productoId, DateTime periodo)
		{
			return Obtener<TarifaPorProducto, TarifaPorProductoDto>(c => c.MaterialPuerto.Id == productoId && c.Periodo == periodo);
		}

		public TarifaPorEmbarqueDto ObtenerTarifaEmbarque(int embarqueId, int productoId, int exportadorId, DateTime periodo)
		{
			var tarifaExistente = Obtener<TarifaPorEmbarque, TarifaPorEmbarqueDto>(c => c.Embarque.Id == embarqueId && c.MaterialPuerto.Id == productoId && c.Exportador.Id == exportadorId);
			if (tarifaExistente == null)
			{
				var embarqueDto = Obtener<Embarque, EmbarqueDto>(e => e.Id == embarqueId);
				var materialDto = Obtener<MaterialPuerto, MaterialPuertoDto>(m => m.Id == productoId);
				var exportadorDto = Obtener<Exportador, ExportadorDto>(e => e.Id == exportadorId);
				var lineup = this._repositorio.Obtener<LineUp>(l => l.Embarque.Id == embarqueDto.Id);
				var allConceptos = Listar<Concepto, ConceptoDto>();
				var tarifaEmbConceptos = new List<TarifaPorEmbarqueConceptoDto>();
				foreach (var concepto in allConceptos)
				{
					var tc = new TarifaPorEmbarqueConceptoDto
					{
						Concepto = concepto
					};
					if (concepto.PorProducto)
					{
						var conceptoTarifaProdPeriodo = this._repositorio.Obtener<TarifaPorProductoConcepto>(t => t.TarifaPorProducto.Periodo == periodo
						&& t.TarifaPorProducto.MaterialPuerto.Id == productoId && t.Concepto.Id == concepto.Id);
						if (conceptoTarifaProdPeriodo != null)
						{
							tc.Valor = conceptoTarifaProdPeriodo.Valor;
						}
						else
						{
							tc.Valor = 0;
						}
					}
					tarifaEmbConceptos.Add(tc);
				}
				var nuevaTarifa = new TarifaPorEmbarqueDto
				{
					Id = 0,
					Embarque = embarqueDto,
					MaterialPuerto = materialDto,
					Exportador = exportadorDto,
					Periodo = periodo,
					TarifaPorEmbarqueConcepto = tarifaEmbConceptos,
				};

				return nuevaTarifa;
			}
			return tarifaExistente;
		}

		public IList<EmbarqueATarifarDto> ListarEmbarquesATarifar(DateTime periodo, int muelleId)
		{
			string descripcionMuelle = null;
			if (muelleId > 0)
			{
				var muelle = _repositorio.Obtener<MuelleDeCarga>(m => m.Id == muelleId);
				descripcionMuelle = muelle?.Descripcion?.ToLowerInvariant();
			}

			var lineupsRaw = _repositorio.Incluir<LineUp>()
				.Where(l => l.Embarque.Ubicacion == 1 &&
							l.ModuloDeCarga != null &&
							l.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.Any(p =>
								p.FechaDesamarro != null &&
								p.FechaDesamarro.Value.Year == periodo.Year &&
								p.FechaDesamarro.Value.Month == periodo.Month))
				.ToList();

			var embarques = lineupsRaw.Select(l => l.Embarque)
				.Where(e =>
						descripcionMuelle == null ||
						(descripcionMuelle == "san benito" && e.SanBenito) ||
						(descripcionMuelle == "nouryon" && e.Noryon) ||
						(descripcionMuelle == "vicentin" && e.Vicentin) ||
						(descripcionMuelle != "san benito" && descripcionMuelle != "nouryon" && descripcionMuelle != "vicentin" && e.OtrosMuelles)
					)
				.Distinct()
				.ToList();

			var embarquesATarifar = embarques
				.Select(e => new EmbarqueATarifarDto
				{
					Embarque = _conversor.Convertir<Embarque, EmbarqueDto>(e),
					Vapor = _conversor.Convertir<Vapor, VaporDto>(e.Vapor),
				})
				.ToList();

			foreach (var embarque in embarquesATarifar)
			{
				embarque.Cargas = !embarque.Embarque.SanBenito ? ObtenerCargasOtrosMuelles(embarque.Embarque) :
							 embarque.Embarque.EsLiquido ? ObtenerCargasLiquido(embarque.Embarque) : ObtenerCargasSolido(embarque.Embarque);
			}

			return embarquesATarifar;
		}

		public IList<TipoContratoTarifaDto> ListarTipoContratoTarifa()
		{
			return Listar<TipoContratoTarifa, TipoContratoTarifaDto>();
		}		

		public EmbarqueATarifarDto ObtenerDetalleEmbATarifar(int embarqueId)
		{
			var embarque = this._repositorio.Obtener<Embarque>(e => e.Id == embarqueId);
			var embarqueATarifar = new EmbarqueATarifarDto
			{
				Embarque = _conversor.Convertir<Embarque, EmbarqueDto>(embarque),
				Vapor = _conversor.Convertir<Vapor, VaporDto>(embarque.Vapor)
			};
			embarqueATarifar.Cargas = !embarqueATarifar.Embarque.SanBenito ? ObtenerCargasOtrosMuelles(embarqueATarifar.Embarque) :
			embarqueATarifar.Embarque.EsLiquido ? ObtenerCargasLiquido(embarqueATarifar.Embarque) : ObtenerCargasSolido(embarqueATarifar.Embarque);
			return embarqueATarifar;
		}

		public void EnviarAlertaBuqueATarifar(int embarqueId)
		{
			var nominaciones = this._repositorio.Listar<Nominacion>(n => n.Embarque.Id == embarqueId && n.FechaEliminacion == null);
			if (nominaciones.Select(n => n.NominacionDatoTecnico).All(ndt => ndt.TipoDeContrato?.Descripcion.ToUpper() != "FAS"))
			{
				var embarqueATarifar = this.ObtenerDetalleEmbATarifar(embarqueId);
				var objDestinatarios = this._repositorio.Obtener<ConfiguracionMail>(x => x.TemplateMail == "AlertaBuqueATarifar");
				if (objDestinatarios == null) throw new Exception("No se encuentran los destinatarios en la base de datos");
				var destinatarios = objDestinatarios.Direcciones.Split(';').ToList();
				destinatarios.RemoveAll(x => String.IsNullOrEmpty(x));
				if (destinatarios.Count == 0) throw new Exception("No se encuentran los destinatarios en la base de datos");

				var cuerpo = GenerarBodyAlertaBuqueATarifar(embarqueATarifar);

				_servicioComandos.Ejecutar(new EnvioMail
				{
					Cuerpo = cuerpo,
					Destinatarios = destinatarios,
					Titulo = "ScatoPuerto, Ingreso de buque: " + embarqueATarifar.Embarque.Patente
				+ " disponible para tarifar.",
				});
			}
		}

		private string GenerarBodyAlertaBuqueATarifar(EmbarqueATarifarDto embarque)
		{
			var muelle = embarque.Embarque.SanBenito ? "San Benito" :
				embarque.Embarque.Vicentin ? "Vicentin" :
				embarque.Embarque.Noryon ? "Noryon" :
				embarque.Embarque.OtrosMuelles ? (embarque.Embarque.OtroMuelleNombre ?? "Otros Muelles") :
				"Otros Muelles";

			var html = "<div style='margin-bottom:10px;'>" + "Les informamos que se encuentra disponible en el módulo de" +
				" Administración el siguiente embarque para tarifar, provisionar." + "</div>";
			html += "<div style='margin-bottom:10px;'><strong>Buque:</strong> " + embarque.Embarque.Patente + "</div>";
			html += "<div style='margin-bottom:10px;'><strong>Muelle:</strong> " + muelle + "</div>";

			html += "<table border='1' cellpadding='5' cellspacing='0' style='border-collapse:collapse;'>";
			html += "<thead><tr><th>Material</th><th>Exportador</th><th>TN</th></tr></thead>";
			html += "<tbody>";

			var listaAgrupada = embarque.Cargas
			.GroupBy(x => new { MaterialId = x.MaterialPuerto.Id, ExportadorId = x.Exportador.Id })
			.Select(g => new CargaPorProductoExportadorDto
			{
				MaterialPuerto = g.First().MaterialPuerto,
				Exportador = g.First().Exportador,
				Cantidad = g.Sum(x => x.Cantidad)
			})
			.ToList();

			foreach (var carga in listaAgrupada)
			{
				html += "<tr>";
				html += $"<td>{carga.MaterialPuerto.Descripcion}</td>";
				html += $"<td>{carga.Exportador.Nombre}</td>";
				html += $"<td style='text-align:right'>{carga.Cantidad}</td>";
				html += "</tr>";
			}
			html += "</tbody></table>";
			return html;
		}

		public IList<EstadoEmbarqueDto> ListarEstadosEmbarque()
		{
			return Listar<EstadoEmbarque, EstadoEmbarqueDto>();
		}

		public void RevertirEmbarquesPorReaperturaTarifaProducto(int productoId, DateTime periodo, string usuario)
		{
			var periodoFecha = new DateTime(periodo.Year, periodo.Month, 1);
			var exportadorMOA = _repositorio.Obtener<Exportador>(e => e.Nombre == "MOLINOS AGRO SA");
			if (exportadorMOA == null) return;

			var embarqueIdsConAcuerdo = _repositorio.Listar<AcuerdoEmbarque>()
				.Select(ae => ae.Embarque.Id)
				.Distinct()
				.ToList();

			var lineups = _repositorio.Listar<LineUp>(l =>
				l.Embarque.SanBenito &&
				l.Embarque.Ubicacion == 1 &&
				!embarqueIdsConAcuerdo.Contains(l.Embarque.Id) &&
				l.ModuloDeCarga != null &&
				l.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.Any(p =>
					p.FechaDesamarro != null &&
					p.FechaDesamarro.Value.Year == periodoFecha.Year &&
					p.FechaDesamarro.Value.Month == periodoFecha.Month
				)
			).ToList();

			var estadoAplicado = _repositorio.Obtener<EstadoEmbarque>(e => e.Id == (int)EstadoEmbarqueEnum.Aplicado);
			var estadoAFacturar = _repositorio.Obtener<EstadoEmbarque>(e => e.Id == (int)EstadoEmbarqueEnum.AFacturar);

			if (estadoAplicado == null || estadoAFacturar == null) return;

			foreach (var lineup in lineups)
			{
				var admEmbarque = _repositorio.Obtener<AdministracionEmbarque>(e => e.Embarque.Id == lineup.Embarque.Id);

				if (admEmbarque == null || admEmbarque.EstadoEmbarque?.Id != estadoAplicado.Id) continue;

				var productosEmbarque = ObtenerProductosEmbarquePorExportador(lineup, exportadorMOA.Id);
				if (productosEmbarque.Contains(productoId))
				{
					admEmbarque.EstadoEmbarque = estadoAFacturar;
					admEmbarque.FechaAplicado = null;

					var logReversion = new LogABM
					{
						Pantalla = "RevertirDesdeAplicado",
						Usuario = usuario,
						Fecha = DateTime.Now,
						Evento = EventoABM.Modificacion,
						Entidad = $"Embarque ID: {lineup.Embarque.Id} revertido de Aplicado a A Facturar por reapertura de Tarifa de Producto (Pizarra)",
						ClaseId = lineup.Embarque.Id
					};
					_repositorio.Agregar(logReversion);
				}
			}

			_repositorio.GuardarCambios();
		}

		#region Tarifa Dolar
		public TarifaCotizacionDolarDto ObtenerTarifaCotizacionDolar(DateTime periodo)
		{
			try
			{
				var fechaPeriodo = new DateTime(periodo.Year, periodo.Month, 1);

				var tarifaCotizacion = _repositorio.Obtener<TarifaCotizacionDolar>(
					tc => tc.Periodo == fechaPeriodo);

				if (tarifaCotizacion == null)
				{
					return null;
				}

				return new TarifaCotizacionDolarDto
				{
					Id = tarifaCotizacion.Id,
					Periodo = tarifaCotizacion.Periodo,
					ValorDolar = tarifaCotizacion.ValorDolar,
					FechaActualizacion = tarifaCotizacion.FechaActualizacion
				};
			}
			catch (Exception ex)
			{
				_log.Error($"Error obteniendo tarifa de cotización dólar para período {periodo}", ex);
				throw;
			}
		}

		public List<string> ObtenerPeriodosDisponiblesTarifaDolar()
		{
			try
			{
				var hoy = DateTime.Now;
				var periodo = new List<DateTime>();

				for (int i = 0; i < 24; i++)
				{
					periodo.Add(hoy.AddMonths(-i));
				}

				for (int i = 1; i <= 12; i++)
				{
					periodo.Add(hoy.AddMonths(i));
				}

				return periodo
					.Select(d => new DateTime(d.Year, d.Month, 1))
					.Distinct()
					.OrderByDescending(d => d)
					.Select(d => $"{d.Month:D2}/{d.Year}")
					.ToList();
			}
			catch (Exception ex)
			{
				_log.Error("Error obteniendo períodos disponibles para tarifa dólar", ex);
				throw;
			}
		}
		#endregion

		#region Acuerdos
		public AcuerdoCombosDto ObtenerCombosAcuerdos(bool conBuques)
		{
			List<VaporDto> buques = new List<VaporDto>();
			var exportadores = _servicioRepositorio.ListaExportadores().ToList();
			var muelles = _servicioRepositorio.ListarMuelles().ToList();
			var materialesPuerto = Listar<MaterialPuerto, MaterialPuertoDto>(x => x.DescripcionCorta != null && x.Activo).ToList();
			if (conBuques)
			{
				buques = _servicioRepositorio.ObtenerVaporesUsados().ToList();
			}

			var idSanBenito = muelles.FirstOrDefault(e => e.Descripcion == "San Benito")?.Id ?? throw new Exception("No se encuentra el muelle 'San Benito' en la base de datos");
			var idMOA = exportadores.FirstOrDefault(e => e.Nombre == "MOLINOS AGRO SA")?.Id ?? throw new Exception("No se encuentra el exportador 'MOLINOS AGRO SA' en la base de datos");

			return new AcuerdoCombosDto
			{
				Tipos = Listar<AcuerdoTipo, AcuerdoTipoDto>().ToList(),
				MuellesDeCarga = muelles,
				Configuraciones = Listar<AcuerdoTipoConfiguracion, AcuerdoTipoConfiguracionDto>().ToList(),
				Exportadores = exportadores,
				MaterialesPuerto = materialesPuerto,
				Buques = buques,
				IdMOA = idMOA,
				IdSanBenito = idSanBenito
			};
		}

		public AcuerdoDto ObtenerAcuerdo(int acuerdoId)
		{
			return Obtener<Acuerdo, AcuerdoDto>(acuerdoId) ?? throw new Exception("No se ha encontrado el acuerdo solicitado.");
		}

		public ArchivoDto ObtenerArchivoAcuerdo(int acuerdoId)
		{
			var acuerdo = this.ObtenerAcuerdo(acuerdoId);
			if (string.IsNullOrEmpty(acuerdo.UbicacionArchivo))
			{
				throw new Exception("El acuerdo no posee un archivo asociado.");
			}
			var archivo = new ArchivoDto(acuerdo.UbicacionArchivo);
			archivo.Nombre = acuerdo.NombreArchivo;
			return archivo;
		}

		private ListarAcuerdosConsulta CrearConsultaAcuerdos(FiltrosAcuerdoDto filtros)
		{
			var tiposAcuerdos = filtros.TiposAcuerdo.Select(t => t.Id).ToList();
			var buques = filtros.Buques.Select(t => t.Id).ToList();
			var muelles = filtros.Muelles.Select(t => t.Id).ToList();
			var exportadores = filtros.Exportadores.Select(t => t.Id).ToList();

			var paginacion = new Paginacion(null, DirOrden.Asc, filtros.Pagina, filtros.ItemsPorPagina == 0 ? 10 : filtros.ItemsPorPagina);

			return new ListarAcuerdosConsulta(paginacion, tiposAcuerdos, filtros.FechaInicio, filtros.FechaFin, buques, muelles, exportadores);
		}

		public ListaPaginada<AcuerdoDto> ListarAcuerdos(FiltrosAcuerdoDto filtros)
		{
			var consulta = CrearConsultaAcuerdos(filtros);
			var resultado = _repositorio.ListarConsultaPaginada(consulta);
			var listaDto = _conversor.ConvertirListaPaginada<Acuerdo, AcuerdoDto>(resultado);

			foreach (var acuerdoDto in listaDto.Items)
			{
				var conceptosIds = acuerdoDto.AcuerdoDetalles
					.SelectMany(d => d.AcuerdoDetalleConceptos.Select(c => c.Id)).ToList();

				acuerdoDto.TieneTarifasCerradas = _repositorio.Existe<AcuerdoPeriodo>(p =>
					p.Cerrado &&
					p.AcuerdoDetalleConceptoPeriodoTarifas.Any(t => conceptosIds.Contains(t.AcuerdoDetalleConcepto.Id)));

				acuerdoDto.TieneEmbarques = _repositorio.Existe<AcuerdoEmbarque>(ae =>
					ae.AcuerdoDetalle.Acuerdo.Id == acuerdoDto.Id);
			}

			return listaDto;
		}

		public void EliminarAcuerdo(int acuerdoId, string usuarioEliminacion)
		{
			var acuerdo = _repositorio.Obtener<Acuerdo>(acuerdoId) ?? throw new InvalidOperationException("No se encuentra el acuerdo con el id especificado.");

			bool tieneEmbarques = _repositorio.Existe<AcuerdoEmbarque>(ae => ae.AcuerdoDetalle.Acuerdo.Id == acuerdoId);

			var conceptosIds = acuerdo.AcuerdoDetalles.SelectMany(d => d.AcuerdoDetalleConceptos.Select(c => c.Id)).ToList();
			bool tieneTarifasCerradas = _repositorio.Existe<AcuerdoPeriodo>(p =>
				p.Cerrado &&
				p.AcuerdoDetalleConceptoPeriodoTarifas.Any(t => conceptosIds.Contains(t.AcuerdoDetalleConcepto.Id))
			);

			if (tieneEmbarques)
			{
				throw new Exception("Hay embarques asociados, verifique.");
			}

			if (tieneTarifasCerradas)
			{
				throw new Exception("El acuerdo no puede ser editado/eliminado contacte a administración.");
			}

			acuerdo.FechaEliminacion = DateTime.Now;
			acuerdo.UsuarioEliminacion = usuarioEliminacion;

			var logAbm = new LogABM
			{
				Pantalla = "EliminarAcuerdo",
				Usuario = usuarioEliminacion,
				Fecha = DateTime.Now,
				Evento = EventoABM.Baja,
				Entidad = $"Acuerdo ID: {acuerdoId}",
				ClaseId = acuerdoId
			};
			_repositorio.Agregar(logAbm);
			_repositorio.GuardarCambios();
		}

		public List<AcuerdoPeriodoDto> ListarTarifasPorAcuerdo(int AcuerdoId)
		{
			var acuerdo = _repositorio.Obtener<Acuerdo>(AcuerdoId) ?? throw new Exception("No se encuentra el acuerdo con el id especificado.");

			var conceptosIds = acuerdo.AcuerdoDetalles.SelectMany(d => d.AcuerdoDetalleConceptos.Select(c => c.Id)).ToList();
			var periodos = _repositorio.Listar<AcuerdoPeriodo>(p => p.AcuerdoDetalleConceptoPeriodoTarifas.Any(pt => conceptosIds.Contains(pt.AcuerdoDetalleConcepto.Id)));

			var periodosDto = new List<AcuerdoPeriodoDto>();

			foreach (var periodo in periodos)
			{
				// Agrupar por detalle (cada período puede tener tarifas de múltiples detalles)
				var detallesEnPeriodo = periodo.AcuerdoDetalleConceptoPeriodoTarifas.Select(t => t.AcuerdoDetalleConcepto.AcuerdoDetalle.Id).Distinct();

				foreach (var detalleId in detallesEnPeriodo)
				{
					var tarifasDetalle = periodo.AcuerdoDetalleConceptoPeriodoTarifas.Where(t => t.AcuerdoDetalleConcepto.AcuerdoDetalle.Id == detalleId).ToList();

					var periodoDto = _conversor.Convertir<AcuerdoPeriodo, AcuerdoPeriodoDto>(periodo);
					periodoDto.AcuerdoDetalleId = detalleId;
					periodoDto.AcuerdoDetalleConceptoPeriodoTarifas = _conversor.ConvertirList<AcuerdoDetalleConceptoPeriodoTarifa, AcuerdoDetalleConceptoPeriodoTarifaDto>(tarifasDetalle).ToList();

					periodosDto.Add(periodoDto);
				}
			}

			return periodosDto.OrderByDescending(p => p.Periodo).ToList();
		}

		public void ReabrirAcuerdo(int periodoAcuerdoId, string usuario)
		{
			var periodoAcuerdo = _repositorio.Obtener<AcuerdoPeriodo>(periodoAcuerdoId) ?? throw new Exception("No se encuentra el periodo con el id especificado.");
			periodoAcuerdo.Cerrado = false;

			// Obtener los embarques afectados por este periodo antes de guardar
			var conceptosIds = periodoAcuerdo.AcuerdoDetalleConceptoPeriodoTarifas
				.Select(t => t.AcuerdoDetalleConcepto.Id).ToList();

			var detallesIds = periodoAcuerdo.AcuerdoDetalleConceptoPeriodoTarifas
				.Select(t => t.AcuerdoDetalleConcepto.AcuerdoDetalle.Id)
				.Distinct()
				.ToList();

			// Obtener todos los embarques vinculados a estos detalles
			var embarquesAfectadosIds = _repositorio.Listar<AcuerdoEmbarque>(
				ae => detallesIds.Contains(ae.AcuerdoDetalle.Id))
				.Select(ae => ae.Embarque.Id)
				.Distinct()
				.ToList();

			var logAbm = new LogABM
			{
				Pantalla = "ReabrirAcuerdo",
				Usuario = usuario,
				Fecha = DateTime.Now,
				Evento = EventoABM.Modificacion,
				Entidad = $"Tarifas Periodo ID: {periodoAcuerdoId} reabierto",
				ClaseId = periodoAcuerdoId
			};
			_repositorio.Agregar(logAbm);
			_repositorio.GuardarCambios();

			// Evaluar si los embarques afectados deben revertir de "Aplicado" a "A Facturar"
			foreach (var embarqueId in embarquesAfectadosIds)
			{
				RevertirDesdeAplicadoSiCorresponde(embarqueId, usuario);
			}
		}

		public ListaPaginada<AcuerdoPorEmbarcacionDto> ListarAcuerdoPorEmbarcacion(int idEmbarque, bool filtrarPorEmbarque, Paginacion paginacion,
			FiltrosAcuerdoPorEmbarcacionDto filtros)
		{
			var detalle = ObtenerDetalleEmbarque(idEmbarque);

			var productosPermitidos = detalle.Cargas.Select(c => c.MaterialPuerto).Distinct().ToList();
			var exportadoresPermitidos = detalle.Exportadores.Select(e => e.Nombre).Distinct().ToList();
			var muellePermitido = detalle.Muelle;
			var totalTnEmbarque = detalle.Cargas.Sum(c => c.Tn);

			var filtrosCorregidos = new FiltrosAcuerdoPorEmbarcacionDto
			{
				Pagina = filtros.Pagina,
				ItemsPorPagina = filtros.ItemsPorPagina,
				Periodo = (filtros?.Periodo == null || filtros.Periodo == DateTime.MinValue || filtros.Periodo.Value.Year < 1900) ? (DateTime?)null : filtros.Periodo,
				Muelle = filtros.Muelle,
				Exportador = filtros.Exportador,
				Material = filtros.Material
			};

			var consulta = new ListarAcuerdosPorEmbarcacionConsulta(
				idEmbarque,
				paginacion,
				filtrosCorregidos,
				productosPermitidos,
				exportadoresPermitidos,
				muellePermitido,
				totalTnEmbarque,
				filtrarPorEmbarque
			);

			return _repositorio.ListarConsultaPaginada(consulta);
		}

		public void AsociarEmbarcacionConAcuerdo(int idEmbarque, int idAcuerdo, int idMaterial, decimal cantidad, string usuario)
		{
			var lineup = _repositorio.ObtenerPrimero<LineUp>(l => l.Embarque.Id == idEmbarque);
			var periodoCarga = lineup?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga.FirstOrDefault(p => p.FechaDesamarro != null);

			if (periodoCarga?.FechaDesamarro != null)
			{
				var fechaDesamarre = periodoCarga.FechaDesamarro.Value;
				var acuerdoVal = _repositorio.Obtener<Acuerdo>(a => a.Id == idAcuerdo);

				if (acuerdoVal != null)
				{
					bool esAntesDelInicio = fechaDesamarre < acuerdoVal.FechaInicio;
					bool esDespuesDelFin = fechaDesamarre > acuerdoVal.FechaFin;

					if (esAntesDelInicio || esDespuesDelFin)
					{
						throw new Exception($"No es posible asociar el acuerdo '{acuerdoVal.Descripcion}'. La vigencia desde {acuerdoVal.FechaInicio:dd/MM/yyyy} al {acuerdoVal.FechaFin:dd/MM/yyyy} no permite para el periodo en el que el buque zarpo.");
					}
				}
			}

			var embarque = _repositorio.Obtener<Embarque>(idEmbarque);
			var acuerdoDetalle = _repositorio.Obtener<AcuerdoDetalle>(ad => ad.Acuerdo.Id == idAcuerdo && ad.MaterialPuerto.Id == idMaterial);

			if (acuerdoDetalle == null)
			{
				throw new Exception("No se encontró el detalle del acuerdo para el material especificado.");
			}

			if (embarque == null) throw new Exception("Embarque no encontrado");

			var nuevoVinculo = new AcuerdoEmbarque
			{
				Embarque = embarque,
				AcuerdoDetalle = acuerdoDetalle,
				Cantidad = cantidad
			};

			_repositorio.Agregar(nuevoVinculo);

			string entidadLog = string.Format("{{ \"EmbarqueId\": {0}, \"AcuerdoId\": {1}, \"MaterialId\": {2}, \"Cantidad\": {3} }}",
				idEmbarque, idAcuerdo, idMaterial, cantidad);

			var logAbm = new LogABM
			{
				Pantalla = "AcuerdosPorEmbarcacion",
				Usuario = usuario,
				Fecha = DateTime.Now,
				Evento = EventoABM.Alta,
				Entidad = entidadLog,
				ClaseId = idAcuerdo
			};
			_repositorio.Agregar(logAbm);

			_repositorio.GuardarCambios();

			EvaluarEstadoAplicadoParaEmbarque(idEmbarque, usuario);
		}

		public void DesasociarEmbarcacionConAcuerdo(int idAcuerdoEmbarque, string usuario)
		{
			var acuerdoEmbarque = _repositorio.Obtener<AcuerdoEmbarque>(idAcuerdoEmbarque);
			if (acuerdoEmbarque == null) throw new Exception("No se encontró la asociación.");

			int embarqueId = acuerdoEmbarque.Embarque.Id;
			int detalleId = acuerdoEmbarque.AcuerdoDetalle.Id;
			int acuerdoIdLog = acuerdoEmbarque.Id;

			string entidadLog = string.Format("Desasociación AcuerdoDetalle ID: {0} - Embarque ID: {1}",
				detalleId, embarqueId);

			var logAbm = new LogABM
			{
				Pantalla = "AcuerdosPorEmbarcacion",
				Usuario = usuario,
				Fecha = DateTime.Now,
				Evento = EventoABM.Baja,
				Entidad = entidadLog,
				ClaseId = acuerdoIdLog
			};
			_repositorio.Agregar(logAbm);

			_repositorio.Remover(acuerdoEmbarque);
			_repositorio.GuardarCambios(); // Guardamos para que el EF la elimine de la base temporal

			if (!CubreCapacidadRequeridaAcuerdos(embarqueId))
			{
				RevertirEstadoEmbarque(embarqueId);
				_repositorio.GuardarCambios();
			}
		}

		public void EditarAsociacionEmbarcacionConAcuerdo(int idAcuerdoEmbarque, decimal nuevaCantidad, string usuario)
		{
			var vinculo = _repositorio.Obtener<AcuerdoEmbarque>(idAcuerdoEmbarque);
			if (vinculo == null) throw new Exception("No se encontró la asociación del acuerdo.");

			var cantidadAnterior = vinculo.Cantidad;

			vinculo.Cantidad = nuevaCantidad;
			_repositorio.GuardarCambios();

			if (!CubreCapacidadRequeridaAcuerdos(vinculo.Embarque.Id))
			{
				RevertirEstadoEmbarque(vinculo.Embarque.Id);
				_repositorio.GuardarCambios();
			}

			string entidadLog = string.Format("{{ \"IdAcuerdoEmbarque\": {0}, \"CantidadAnterior\": {1}, \"CantidadNueva\": {2} }}",
				idAcuerdoEmbarque, cantidadAnterior, nuevaCantidad);

			var logAbm = new LogABM
			{
				Pantalla = "AcuerdosPorEmbarcacion",
				Usuario = usuario,
				Fecha = DateTime.Now,
				Evento = EventoABM.Modificacion,
				Entidad = entidadLog,
				ClaseId = vinculo.Id
			};
			_repositorio.Agregar(logAbm);
			_repositorio.GuardarCambios();

			EvaluarEstadoAplicadoParaEmbarque(vinculo.Embarque.Id, usuario);
		}

		private bool CubreCapacidadRequeridaAcuerdos(int embarqueId)
		{
			var detalleATarifar = ObtenerDetalleEmbATarifar(embarqueId);
			if (detalleATarifar == null || detalleATarifar.Cargas == null) return false;

			var embarque = detalleATarifar.Embarque;

			var cargasRequeridas = detalleATarifar.Cargas.Where(c =>
				(embarque.SanBenito && c.Exportador.Nombre != "MOLINOS AGRO SA") ||
				(!embarque.SanBenito && c.Exportador.Nombre == "MOLINOS AGRO SA")
			).ToList();

			if (!cargasRequeridas.Any()) return true;

			var cargaRequeridaPorProducto = cargasRequeridas
				.GroupBy(c => c.MaterialPuerto.Id)
				.ToDictionary(g => g.Key, g => g.Sum(c => c.Cantidad));

			var acuerdosAsociados = _repositorio.Listar<AcuerdoEmbarque>(ae => ae.Embarque.Id == embarqueId).ToList();

			foreach (var req in cargaRequeridaPorProducto)
			{
				int materialId = req.Key;
				decimal cantidadRequerida = req.Value;

				decimal cantidadAsociada = acuerdosAsociados
					.Where(ae => ae.AcuerdoDetalle.MaterialPuerto.Id == materialId)
					.Sum(ae => ae.Cantidad);

				if (cantidadAsociada < cantidadRequerida)
				{
					return false;
				}
			}

			return true;
		}

		#endregion

		#region Estado Aplicado

		/// <summary>
		/// Evalúa si un embarque que tiene acuerdos vinculados debe transicionar al estado "Aplicado".
		/// Se invoca tras cerrar tarifas de un acuerdo.
		/// 
		/// Lógica:
		/// 1. Embarque debe haber zarpado (Ubicacion == 1)
		/// 2. No debe estar ya en estado "Facturado"
		/// 3. Obtener el período desde FechaFinalizacionCarga del embarque
		/// 4. Para TODOS los AcuerdoEmbarque vinculados al embarque, navegar:
		///    AcuerdoEmbarque → AcuerdoDetalle → AcuerdoDetalleConceptos → AcuerdoDetalleConceptoPeriodoTarifas → AcuerdoPeriodo
		///    y verificar que exista un AcuerdoPeriodo para el mes/año del período con Cerrado == true
		/// 5. Si todos están cerrados → transicionar a "Aplicado"
		/// </summary>
		public void EvaluarEstadoAplicadoParaEmbarque(int embarqueId, string usuario)
		{
			var embarque = _repositorio.Obtener<Embarque>(e => e.Id == embarqueId);
			if (embarque == null || embarque.Ubicacion != 1) return;

			var admEmbarque = _repositorio.Obtener<AdministracionEmbarque>(e => e.Embarque.Id == embarqueId);
			if (admEmbarque?.EstadoEmbarque?.Id == (int)EstadoEmbarqueEnum.Facturado ||
				admEmbarque?.EstadoEmbarque?.Id == (int)EstadoEmbarqueEnum.Aplicado) return;

			if (!CubreCapacidadRequeridaAcuerdos(embarqueId)) return;

			// TODO: para cuando se realice el merge con Otros Muelles
			// para averiguar la fecha que se toma para el periodo se debe de tomar por:
			// Embarque.OtroMuelleCarga.OtroMuelleCargaDetalle.FechaHoraFin
			var lineup = _repositorio.Obtener<LineUp>(l => l.Embarque.Id == embarqueId);
			var periodoCarga = lineup?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga.FirstOrDefault(p => p.FechaDesamarro != null);
			if (periodoCarga?.FechaDesamarro == null) return;

			var fechaDesamarre = periodoCarga.FechaDesamarro.Value;
			var periodoPeriodo = new DateTime(fechaDesamarre.Year, fechaDesamarre.Month, 1);

			var acuerdoEmbarques = _repositorio.Listar<AcuerdoEmbarque>(ae => ae.Embarque.Id == embarqueId).ToList();

			if (!acuerdoEmbarques.Any()) return;

			bool todosLosPeriodosCerrados = true;
			foreach (var acuerdoEmbarque in acuerdoEmbarques)
			{
				var conceptosIds = acuerdoEmbarque.AcuerdoDetalle.AcuerdoDetalleConceptos.Select(c => c.Id).ToList();
				if (!conceptosIds.Any()) { todosLosPeriodosCerrados = false; break; }

				var periodoAcuerdo = _repositorio.ObtenerPrimero<AcuerdoPeriodo>(p =>
					p.Periodo == periodoPeriodo &&
					p.AcuerdoDetalleConceptoPeriodoTarifas.Any(t => conceptosIds.Contains(t.AcuerdoDetalleConcepto.Id))
				);

				if (periodoAcuerdo == null || !periodoAcuerdo.Cerrado)
				{
					todosLosPeriodosCerrados = false;
					break;
				}
			}

			if (todosLosPeriodosCerrados)
			{
				TransicionarAAplicado(embarque, usuario);
			}
		}

		/// <summary>
		/// Evalúa si embarques de San Benito con exportador MOA (sin acuerdos vinculados)
		/// deben transicionar a "Aplicado" tras el cierre de una tarifa por producto.
		/// 
		/// Se invoca desde ProcesadorGuardarTarifaPorProducto cuando se cierra una tarifa.
		/// 
		/// Lógica:
		/// 1. Buscar embarques en San Benito, zarpados, sin AcuerdoEmbarque vinculado
		/// 2. Para cada embarque, obtener los productos del exportador MOA
		/// 3. Si el producto cerrado es uno de ellos, verificar que TODOS los productos
		///    del embarque tengan TarifaPorProducto cerrada para el período
		/// 4. Si todos cerrados → transicionar a "Aplicado"
		/// </summary>
		public void EvaluarEstadoAplicadoPorCierreTarifaProducto(int productoId, DateTime periodo, string usuario)
		{
			var periodoFecha = new DateTime(periodo.Year, periodo.Month, 1);

			var exportadorMOA = _repositorio.Obtener<Exportador>(e => e.Nombre == "MOLINOS AGRO SA");
			if (exportadorMOA == null) return;

			// IDs de embarques que tienen acuerdos vinculados (excluir)
			var embarqueIdsConAcuerdo = _repositorio.Listar<AcuerdoEmbarque>()
				.Select(ae => ae.Embarque.Id)
				.Distinct()
				.ToList();

			var lineups = _repositorio.Listar<LineUp>(l =>
				l.Embarque.SanBenito &&
				l.Embarque.Ubicacion == 1 &&
				!embarqueIdsConAcuerdo.Contains(l.Embarque.Id) &&
				l.ModuloDeCarga != null &&
				l.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.Any(p =>
					p.FechaDesamarro != null &&
					p.FechaDesamarro.Value.Year == periodoFecha.Year &&
					p.FechaDesamarro.Value.Month == periodoFecha.Month
				)
			).ToList();

			foreach (var lineup in lineups)
			{
				var productosEmbarque = ObtenerProductosEmbarquePorExportador(lineup, exportadorMOA.Id);
				if (!productosEmbarque.Contains(productoId)) continue;

				// Verificar que TODOS los productos del embarque tengan tarifa cerrada para el período
				bool todosProductosCerrados = true;

				foreach (var prodId in productosEmbarque)
				{
					var tarifaProducto = _repositorio.Obtener<TarifaPorProducto>(t =>
						t.MaterialPuerto.Id == prodId &&
						t.Periodo == periodoFecha);

					if (tarifaProducto == null || !tarifaProducto.Cerrado)
					{
						todosProductosCerrados = false;
						break;
					}
				}

				if (todosProductosCerrados)
				{
					// Verificar que no esté ya en Facturado o Aplicado
					var admEmbarque = _repositorio.Obtener<AdministracionEmbarque>(e => e.Embarque.Id == lineup.Embarque.Id);
					if (admEmbarque?.EstadoEmbarque?.Id == (int)EstadoEmbarqueEnum.Facturado) continue;
					if (admEmbarque?.EstadoEmbarque?.Id == (int)EstadoEmbarqueEnum.Aplicado) continue;

					TransicionarAAplicado(lineup.Embarque, usuario);
				}
			}
		}

		private List<int> ObtenerProductosEmbarquePorExportador(LineUp lineup, int exportadorId)
		{
			var productosIds = new List<int>();

			if (lineup.Embarque.EsLiquido)
			{
				productosIds = lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos
					.SelectMany(pt => pt.ModuloDeCargaPlanillaDeTurnosDetallesLiquido)
					.Where(d => d.Exportador.Id == exportadorId)
					.Select(d => d.MaterialPuerto.Id)
					.Distinct()
					.ToList();
			}
			else
			{
				productosIds = lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos
					.SelectMany(pt => pt.ModuloDeCargaPlanillaDeTurnosDetallesSolido)
					.Where(d => d.Exportador.Id == exportadorId)
					.Select(d => d.MaterialPuerto.Id)
					.Distinct()
					.ToList();
			}

			return productosIds;
		}

		/// <summary>
		/// Transiciona un embarque al estado "Aplicado", creando o actualizando
		/// el registro de AdministracionEmbarque con FechaAplicado = DateTime.Now.
		/// </summary>
		private void TransicionarAAplicado(Embarque embarque, string usuario)
		{
			var estadoAplicado = _repositorio.Obtener<EstadoEmbarque>(e => e.Id == (int)EstadoEmbarqueEnum.Aplicado);
			if (estadoAplicado == null) return;

			var admEmbarque = _repositorio.Obtener<AdministracionEmbarque>(e => e.Embarque.Id == embarque.Id);

			// Verificar que no esté ya en Facturado
			var estadoFacturado = _repositorio.Obtener<EstadoEmbarque>(e => e.Id == (int)EstadoEmbarqueEnum.Facturado);
			if (admEmbarque?.EstadoEmbarque?.Id == estadoFacturado?.Id) return;

			// Verificar que no esté ya en Aplicado
			if (admEmbarque?.EstadoEmbarque?.Id == estadoAplicado.Id) return;

			if (admEmbarque == null)
			{
				var nuevaAdm = new AdministracionEmbarque
				{
					Embarque = embarque,
					EstadoEmbarque = estadoAplicado,
					FechaAplicado = DateTime.Now
				};
				_repositorio.Agregar(nuevaAdm);
			}
			else
			{
				admEmbarque.EstadoEmbarque = estadoAplicado;
				admEmbarque.FechaAplicado = DateTime.Now;
			}

			var logAbm = new LogABM
			{
				Pantalla = "EvaluarEstadoAplicado",
				Usuario = usuario,
				Fecha = DateTime.Now,
				Evento = EventoABM.Modificacion,
				Entidad = $"Embarque ID: {embarque.Id} transicionado a estado Aplicado",
				ClaseId = embarque.Id
			};
			_repositorio.Agregar(logAbm);
			_repositorio.GuardarCambios();
		}

		/// <summary>
		/// Revierte un embarque del estado "Aplicado" a "A Facturar" si alguno
		/// de sus acuerdos vinculados ya no tiene el período cerrado.
		/// Se invoca desde ReabrirAcuerdo.
		/// 
		/// Lógica:
		/// 1. Si el embarque no está en estado "Aplicado", no hacer nada
		/// 2. Verificar si TODOS los acuerdos vinculados siguen cerrados para el período
		/// 3. Si al menos uno no está cerrado → revertir a "A Facturar" y FechaAplicado = null
		/// </summary>
		private void RevertirDesdeAplicadoSiCorresponde(int embarqueId, string usuario)
		{
			var admEmbarque = _repositorio.Obtener<AdministracionEmbarque>(e => e.Embarque.Id == embarqueId);
			if (admEmbarque == null) return;

			// Solo revertir si está en estado "Aplicado"
			if (admEmbarque.EstadoEmbarque?.Id != (int)EstadoEmbarqueEnum.Aplicado) return;

			var lineup = _repositorio.Obtener<LineUp>(l => l.Embarque.Id == embarqueId);
			if (lineup?.ModuloDeCarga == null) return;

			var periodoCarga = lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga
				.FirstOrDefault(p => p.FechaDesamarro != null);
			if (periodoCarga?.FechaDesamarro == null) return;

			var fechaDesamarre = periodoCarga.FechaDesamarro.Value;
			var periodoPeriodo = new DateTime(fechaDesamarre.Year, fechaDesamarre.Month, 1);

			// Verificar si todos los acuerdos vinculados siguen cerrados
			var acuerdoEmbarques = _repositorio.Listar<AcuerdoEmbarque>(ae => ae.Embarque.Id == embarqueId).ToList();

			bool todosLosPeriodosCerrados = acuerdoEmbarques.Any();

			foreach (var acuerdoEmbarque in acuerdoEmbarques)
			{
				var conceptosIds = acuerdoEmbarque.AcuerdoDetalle.AcuerdoDetalleConceptos
					.Select(c => c.Id).ToList();

				if (!conceptosIds.Any())
				{
					todosLosPeriodosCerrados = false;
					break;
				}

				var periodoAcuerdo = _repositorio.ObtenerPrimero<AcuerdoPeriodo>(p =>
					p.Periodo == periodoPeriodo &&
					p.AcuerdoDetalleConceptoPeriodoTarifas.Any(t => conceptosIds.Contains(t.AcuerdoDetalleConcepto.Id))
				);

				if (periodoAcuerdo == null || !periodoAcuerdo.Cerrado)
				{
					todosLosPeriodosCerrados = false;
					break;
				}
			}

			// Si ya no todos están cerrados, revertir a "A Facturar"
			if (!todosLosPeriodosCerrados)
			{
				var estadoAFacturar = _repositorio.Obtener<EstadoEmbarque>(e => e.Id == (int)EstadoEmbarqueEnum.AFacturar);
				if (estadoAFacturar == null) return;

				admEmbarque.EstadoEmbarque = estadoAFacturar;
				admEmbarque.FechaAplicado = null;

				var logAbm = new LogABM
				{
					Pantalla = "RevertirDesdeAplicado",
					Usuario = usuario,
					Fecha = DateTime.Now,
					Evento = EventoABM.Modificacion,
					Entidad = $"Embarque ID: {embarqueId} revertido de Aplicado a A Facturar por reapertura de tarifa de acuerdo",
					ClaseId = embarqueId
				};
				_repositorio.Agregar(logAbm);
				_repositorio.GuardarCambios();
			}
		}

		private void RevertirEstadoEmbarque(int embarqueId)
		{
			var admEmbarque = _repositorio.ObtenerPrimero<AdministracionEmbarque>(a => a.Embarque.Id == embarqueId);
			if (admEmbarque == null) return;

			int estadoAnterior = admEmbarque.EstadoEmbarque?.Id ?? 0;

			if (estadoAnterior == 5 || estadoAnterior == 6)
			{
				var estadoAFacturar = _repositorio.Obtener<EstadoEmbarque>(e => e.Id == 4);
				if (estadoAFacturar != null)
				{
					admEmbarque.EstadoEmbarque = estadoAFacturar;

					if (estadoAnterior == 5) // Era APLICADO
					{
						admEmbarque.FechaAplicado = null;
					}
					else if (estadoAnterior == 6) // Era FACTURADO
					{
						admEmbarque.FechaAplicado = null;
						admEmbarque.FechaFacturado = null;
					}
				}
			}
		}
		#endregion

		#region Provision de Gastos

		private IList<CargaPorProductoExportadorDto> ObtenerCargasSolido(EmbarqueDto e)
		{
			var lineups = this._repositorio.Incluir<LineUp>().Where(l => l.Embarque.Id == e.Id).ToList();
			var modulosId = lineups.Where(l => l.ModuloDeCarga != null).Select(l => l.ModuloDeCarga.Id).ToList();
			if (!modulosId.Any()) return new List<CargaPorProductoExportadorDto>();

			var turnos = this._repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(t => modulosId.Contains(t.ModuloDeCarga.Id)).ToList();
			var turnosIds = turnos.Select(t => t.Id).ToList();
			if (!turnosIds.Any()) return new List<CargaPorProductoExportadorDto>();

			var detalles = this._repositorio.Listar<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(d => turnosIds.Contains(d.ModuloDeCargaPlanillaDeTurnos.Id)).ToList();

			return detalles.Where(d => d.MaterialPuerto != null && d.Exportador != null)
						   .Select(y => new CargaPorProductoExportadorDto
						   {
							   MaterialPuerto = new MaterialPuertoDto { Id = y.MaterialPuerto.Id, Descripcion = y.MaterialPuerto.Descripcion },
							   Exportador = new ExportadorDto { Id = y.Exportador.Id, Nombre = y.Exportador.Nombre },
							   Cantidad = (decimal)y.Cantidad / 1000m
						   }).ToList();
		}

		private IList<CargaPorProductoExportadorDto> ObtenerCargasLiquido(EmbarqueDto e)
		{
			var lineups = this._repositorio.Incluir<LineUp>().Where(l => l.Embarque.Id == e.Id).ToList();
			var modulosId = lineups.Where(l => l.ModuloDeCarga != null).Select(l => l.ModuloDeCarga.Id).ToList();
			if (!modulosId.Any()) return new List<CargaPorProductoExportadorDto>();

			var turnos = this._repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(t => modulosId.Contains(t.ModuloDeCarga.Id)).ToList();
			var turnosIds = turnos.Select(t => t.Id).ToList();
			if (!turnosIds.Any()) return new List<CargaPorProductoExportadorDto>();

			var detalles = this._repositorio.Listar<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>(d => turnosIds.Contains(d.ModuloDeCargaPlanillaDeTurnos.Id)).ToList();

			return detalles.Where(d => d.MaterialPuerto != null && d.Exportador != null)
						   .Select(y => new CargaPorProductoExportadorDto
						   {
							   MaterialPuerto = new MaterialPuertoDto { Id = y.MaterialPuerto.Id, Descripcion = y.MaterialPuerto.Descripcion },
							   Exportador = new ExportadorDto { Id = y.Exportador.Id, Nombre = y.Exportador.Nombre },
							   Cantidad = y.Cantidad
						   }).ToList();
		}

		private IList<CargaPorProductoExportadorDto> ObtenerCargasOtrosMuelles(EmbarqueDto e)
		{
			var cargas = new List<CargaPorProductoExportadorDto>();

			var nomDatoTecExp = _repositorio.Listar<Nominacion>(n => n.Embarque.Id == e.Id && n.FechaEliminacion == null)
				.SelectMany(t => t.NominacionDatoTecnico.NominacionDatoTecnicoExportador)
				.Select(y => new CargaPorProductoExportadorDto
				{
					Exportador = _conversor.Convertir<Exportador, ExportadorDto>(y.Exportador),
					MaterialPuerto = _conversor.Convertir<MaterialPuerto, MaterialPuertoDto>(y.NominacionDatoTecnico.MaterialPuerto),
					Cantidad = y.Cantidad
				});

			var nominacionesEmbarque = _repositorio.Listar<NominacionEmbarque>(ne => ne.Embarque.Id == e.Id && ne.Nominacion.FechaEliminacion == null)
				.Select(x => x.Nominacion)
				.SelectMany(n => n.NominacionDatoTecnico.NominacionDatoTecnicoExportador)
				.Select(y => new CargaPorProductoExportadorDto
				{
					Exportador = _conversor.Convertir<Exportador, ExportadorDto>(y.Exportador),
					MaterialPuerto = _conversor.Convertir<MaterialPuerto, MaterialPuertoDto>(y.NominacionDatoTecnico.MaterialPuerto),
					Cantidad = y.Cantidad
				});

			cargas.AddRange(nomDatoTecExp);
			cargas.AddRange(nominacionesEmbarque);

			return cargas;
		}

		public CombosConsultaProvisionesDto ObtenerCombosProvisiones()
		{
			var response = new CombosConsultaProvisionesDto
			{
				Muelles = _servicioRepositorio.ListarMuelles().ToList(),
				Exportadores = _servicioRepositorio.ListaExportadores().ToList(),
				Productos = _servicioRepositorio.ListaMaterialesPuerto().ToList(),
				Acuerdos = Listar<Acuerdo, AcuerdoDto>().ToList(),
			};
			return response;
		}

		public AltaProvisionYGastoDto ObtenerProvision(int? muelleId, DateTime periodo, int? embarqueId, int? productoId, int? exportadorId, int? acuerdoId)
		{
			var datosBase = ObtenerDatosBaseProvision(muelleId, periodo, embarqueId, productoId, exportadorId, acuerdoId);

			var altaProvision = ObtenerProvisionVisualizarCalculado(datosBase.TarifasAplicables, datosBase.CotizacionGlobal);

			altaProvision.InfoFiltrada = datosBase.InfoFiltrada;
			altaProvision.CotizacionDolar = datosBase.CotizacionGlobal;

			return altaProvision;
		}

		private DatosBaseProvisionInterno ObtenerDatosBaseProvision(int? muelleId, DateTime periodo, int? embarqueId, int? productoId, int? exportadorId, int? acuerdoId)
		{
			InfoFiltrada infoFiltrada = new InfoFiltrada
			{
				Buques = new List<string>(),
				Materiales = new List<string>(),
				Acuerdos = new List<string>(),
				Tn = 0
			};

			var exportadorMOA = _repositorio.ObtenerPrimero<Exportador>(e => e.Nombre.Contains("MOLINOS AGRO SA"));
			var tarifasEmbarque = _repositorio.Listar<TarifaPorEmbarque>(t => t.Periodo.Year == periodo.Year && t.Periodo.Month == periodo.Month).ToList();
			var tarifasProducto = _repositorio.Listar<TarifaPorProducto>(t => t.Periodo.Year == periodo.Year && t.Periodo.Month == periodo.Month && t.Cerrado).ToList();

			var lineupsRaw = _repositorio.Incluir<LineUp>()
					.Where(l => l.Embarque.Ubicacion == 1 && l.ModuloDeCarga != null && l.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.Any(p => p.FechaDesamarro != null && p.FechaDesamarro.Value.Year == periodo.Year && p.FechaDesamarro.Value.Month == periodo.Month))
					.ToList();
			var lineups = lineupsRaw.GroupBy(l => l.Embarque.Id).Select(g => g.First()).ToList();

			if (muelleId != null)
			{
				var muelle = this._repositorio.Obtener<MuelleDeCarga>(muelleId);
				if (muelle != null)
				{
					lineups = lineups.Where(l => (muelle.Descripcion == "San Benito" && l.Embarque.SanBenito) || (muelle.Descripcion == "Vicentin" && l.Embarque.Vicentin) || (muelle.Descripcion == "Nouryon" && l.Embarque.Noryon) || (muelle.Descripcion == "Otros Muelles" && l.Embarque.OtrosMuelles)).ToList();
				}
			}

			if (embarqueId != null) lineups = lineups.Where(l => l.Embarque.Id == embarqueId).ToList();

			var tarifasAplicables = new List<TarifaBaseCalculoDto>();
			var buquesMatch = new HashSet<string>();
			var materialesMatch = new HashSet<string>();
			decimal tnTotalMatch = 0;

			foreach (var lineup in lineups)
			{
				var embarqueDto = _conversor.Convertir<Embarque, EmbarqueDto>(lineup.Embarque);
				var cargasSeguras = lineup.Embarque.EsLiquido ? ObtenerCargasLiquido(embarqueDto) : ObtenerCargasSolido(embarqueDto);

				var peAgrupado = cargasSeguras.GroupBy(c => new { MaterialId = c.MaterialPuerto.Id, ExportadorId = c.Exportador.Id })
					.Select(g => new {
						MaterialPuerto = g.First().MaterialPuerto,
						Exportador = g.First().Exportador,
						Cantidad = g.Sum(x => x.Cantidad)
					}).ToList();

				foreach (var pe in peAgrupado)
				{
					if (pe.MaterialPuerto == null || pe.Exportador == null) continue;
					if (productoId != null && pe.MaterialPuerto.Id != productoId) continue;
					if (exportadorId != null && pe.Exportador.Id != exportadorId) continue;

					var acuerdoEmbarque = _repositorio.ObtenerPrimero<AcuerdoEmbarque>(ae => ae.Embarque.Id == lineup.Embarque.Id && ae.AcuerdoDetalle.MaterialPuerto.Id == pe.MaterialPuerto.Id);

					if (acuerdoId != null)
					{
						if (acuerdoEmbarque == null) continue;
						if (acuerdoEmbarque.AcuerdoDetalle.Acuerdo.Id != acuerdoId) continue;
					}

					buquesMatch.Add(lineup.Embarque.Patente);
					materialesMatch.Add(pe.MaterialPuerto.Descripcion);
					tnTotalMatch += pe.Cantidad;

					var fechaCarga = lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.FirstOrDefault(p => p.FechaDesamarro != null && p.FechaDesamarro.Value.Year == periodo.Year && p.FechaDesamarro.Value.Month == periodo.Month)?.FechaDesamarro;
					decimal cotizacionDolar = 1;

					if (fechaCarga != null)
					{
						var periodoCotizacion = new DateTime(fechaCarga.Value.Year, fechaCarga.Value.Month, 1);
						var dolar = _repositorio.Obtener<TarifaCotizacionDolar>(t => t.Periodo == periodoCotizacion);
						if (dolar != null && dolar.ValorDolar > 0) cotizacionDolar = dolar.ValorDolar;

						var lineupDto = _conversor.Convertir<LineUp, LineUpDto>(lineup);
						var exportadorDto = pe.Exportador;

						if (acuerdoEmbarque != null)
						{
							var tarifasAcuerdo = _repositorio.Listar<AcuerdoDetalleConceptoPeriodoTarifa>(t => t.AcuerdoPeriodo.Periodo == periodoCotizacion && t.AcuerdoPeriodo.Cerrado == true && t.AcuerdoDetalleConcepto.AcuerdoDetalle.Id == acuerdoEmbarque.AcuerdoDetalle.Id).ToList();

							tarifasAplicables.Add(new TarifaBaseCalculoDto
							{
								Lineup = lineupDto,
								Embarque = embarqueDto,
								AcuerdoEmbarque = _conversor.Convertir<AcuerdoEmbarque, AcuerdoEmbarqueDto>(acuerdoEmbarque),
								TarifasAcuerdo = tarifasAcuerdo.Any() ? _conversor.ConvertirList<AcuerdoDetalleConceptoPeriodoTarifa, AcuerdoDetalleConceptoPeriodoTarifaDto>(tarifasAcuerdo).ToList() : new List<AcuerdoDetalleConceptoPeriodoTarifaDto>(),
								CotizacionDolar = cotizacionDolar,
								Exportador = exportadorDto
							});
						}
						else if (lineup.Embarque.SanBenito && exportadorMOA != null && pe.Exportador.Id == exportadorMOA.Id)
						{
							var tarifaProd = tarifasProducto.FirstOrDefault(t => t.MaterialPuerto != null && t.MaterialPuerto.Id == pe.MaterialPuerto.Id);

							if (tarifaProd == null)
							{
								tarifaProd = _repositorio.ObtenerPrimero<TarifaPorProducto>(t => t.Periodo.Year == periodo.Year && t.Periodo.Month == periodo.Month && t.Cerrado && t.MaterialPuerto.Id == pe.MaterialPuerto.Id);
							}

							if (tarifaProd != null)
							{
								var dtoProducto = _conversor.Convertir<TarifaPorProducto, TarifaPorProductoDto>(tarifaProd);

								if (dtoProducto.TarifaPorProductoConcepto == null || !dtoProducto.TarifaPorProductoConcepto.Any())
								{
									var conceptosBd = _repositorio.Listar<TarifaPorProductoConcepto>(c => c.TarifaPorProducto.Id == tarifaProd.Id).ToList();
									if (conceptosBd.Any())
									{
										dtoProducto.TarifaPorProductoConcepto = conceptosBd.Select(c =>
										{
											var concDto = _conversor.Convertir<Concepto, ConceptoDto>(c.Concepto);
											if (concDto == null) { concDto = new ConceptoDto { Id = c.Concepto.Id, Descripcion = c.Concepto.Descripcion }; }

											return new TarifaPorProductoConceptoDto
											{
												Id = c.Id,
												Concepto = concDto,
												Valor = c.Valor
											};
										}).ToList();
									}
								}
								tarifasAplicables.Add(new TarifaBaseCalculoDto { Lineup = lineupDto, Embarque = embarqueDto, TarifaProducto = dtoProducto, CotizacionDolar = cotizacionDolar, Exportador = exportadorDto });
							}
						}
						else
						{
							var tarifaEmb = tarifasEmbarque.FirstOrDefault(t => t.Embarque != null && t.MaterialPuerto != null && t.Exportador != null && t.Embarque.Id == lineup.Embarque.Id && t.MaterialPuerto.Id == pe.MaterialPuerto.Id && t.Exportador.Id == pe.Exportador.Id);
							if (tarifaEmb != null) tarifasAplicables.Add(new TarifaBaseCalculoDto { Lineup = lineupDto, Embarque = embarqueDto, TarifaEmbarque = _conversor.Convertir<TarifaPorEmbarque, TarifaPorEmbarqueDto>(tarifaEmb), CotizacionDolar = cotizacionDolar, Exportador = exportadorDto });
						}
					}
				}
			}

			infoFiltrada.Buques = buquesMatch.ToList();
			infoFiltrada.Materiales = materialesMatch.ToList();
			infoFiltrada.Tn = tnTotalMatch;

			decimal cotizacionGlobal = 1;
			var tarifaDolarGen = _repositorio.Obtener<TarifaCotizacionDolar>(t => t.Periodo.Year == periodo.Year && t.Periodo.Month == periodo.Month);
			if (tarifaDolarGen != null && tarifaDolarGen.ValorDolar > 0) cotizacionGlobal = tarifaDolarGen.ValorDolar;

			return new DatosBaseProvisionInterno { TarifasAplicables = tarifasAplicables, InfoFiltrada = infoFiltrada, CotizacionGlobal = cotizacionGlobal };
		}

		private AltaProvisionYGastoDto ObtenerProvisionVisualizarCalculado(List<TarifaBaseCalculoDto> tarifas, decimal cotizacionDolarPeriodo)
		{
			AltaProvisionYGastoDto totalizador = new AltaProvisionYGastoDto
			{
				ProvisionId = 0,
				ItemsProvision = new List<ItemProvisionDto>(),
				TotalIngresosARS = 0,
				TotalIngresosUSD = 0,
				TotalEgresosARS = 0,
				TotalEgresosUSD = 0,
				GranTotalIngresosUSD = 0,
				GranTotalEgresosUSD = 0
			};

			var allConceptos = Listar<Concepto, ConceptoDto>();

			foreach (var concepto in allConceptos)
			{
				var itemProvision = new ItemProvisionDto { Concepto = concepto, Valor = 0 };
				decimal valorPuroDelConcepto = 0;

				foreach (var t in tarifas)
				{
					decimal valorBase = 0;

					if (t.AcuerdoEmbarque != null && t.TarifasAcuerdo != null)
					{
						var tarifaConcepto = t.TarifasAcuerdo.FirstOrDefault(c => c.ConceptoId == concepto.Id);
						if (tarifaConcepto != null)
						{
							valorBase = tarifaConcepto.ValorTarifa;
						}
					}
					else if (t.TarifaProducto != null && concepto.PorProducto)
					{
						var conceptoTarifaDto = t.TarifaProducto.TarifaPorProductoConcepto.FirstOrDefault(c => c.Concepto.Id == concepto.Id);
						if (conceptoTarifaDto != null) valorBase = conceptoTarifaDto.Valor;
					}

					valorPuroDelConcepto += valorBase;
				}

				if (valorPuroDelConcepto > 0)
				{
					itemProvision.Valor = Math.Round(valorPuroDelConcepto, 2, MidpointRounding.AwayFromZero);
					totalizador.ItemsProvision.Add(itemProvision);

					bool esDolar = concepto.Moneda != null && (concepto.Moneda.Descripcion == "Dolares" || concepto.Moneda.Id == 2);
					bool esIngreso = concepto.TipoConcepto != null && (concepto.TipoConcepto.Descripcion == "Ingreso" || concepto.TipoConcepto.Id == 1);

					if (esIngreso) 
					{ 
						if (esDolar) totalizador.TotalIngresosUSD += itemProvision.Valor;
						else totalizador.TotalIngresosARS += itemProvision.Valor; 
					}
					else 
					{ 
						if (esDolar) totalizador.TotalEgresosUSD += itemProvision.Valor; 
						else totalizador.TotalEgresosARS += itemProvision.Valor; 
					}
				}
			}

			decimal cotizacionSegura = cotizacionDolarPeriodo > 0 ? cotizacionDolarPeriodo : 1;
			totalizador.GranTotalIngresosUSD = totalizador.TotalIngresosUSD + (totalizador.TotalIngresosARS / cotizacionSegura);
			totalizador.GranTotalEgresosUSD = totalizador.TotalEgresosUSD + (totalizador.TotalEgresosARS / cotizacionSegura);

			return totalizador;
		}

		public DatosExportacionProvisionDto ObtenerDatosExportacionProvision(int? muelleId, DateTime periodo, int? embarqueId, int? productoId, int? exportadorId, int? acuerdoId)
		{
			var datosBase = ObtenerDatosBaseProvision(muelleId, periodo, embarqueId, productoId, exportadorId, acuerdoId);
			var producto = _repositorio.Obtener<MaterialPuerto>(p => p.Id == productoId);

			return new DatosExportacionProvisionDto
			{
				Tarifas = datosBase.TarifasAplicables,
				NombreProducto = producto != null ? producto.Descripcion : "TODOS",
				Periodo = periodo,
				CotizacionDolar = datosBase.CotizacionGlobal
			};
		}

		#endregion
	}
}