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
			return _repositorio.ListarConsultaPaginada(consulta);
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
			var administracionEmbarque = _conversor.Convertir<AdministracionEmbarque, AdministracionEmbarqueDto>(lineup.Embarque.AdministracionEmbarque);
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
			//Es embarque fas
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
				Estado = administracionEmbarque?.Estado.Descripcion ?? estado,
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
				FechaLineUp = nominaciones.FirstOrDefault()?.FechaEnvioLineUp ?? null,
				FechaOperaciones = lineup.PlanoDeCarga?.FechaDeCreacion ?? null,
				FechaCalidad = lineup.ModuloDeCarga?.FechaDeCreacion ?? null,
				FechaZarpado = lineup.ModuloDeCarga?.FechaZarpado ?? null,
				FechaFacturado = lineup.Embarque?.AdministracionEmbarque?.FechaFacturado ?? null,
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
				Estado = administracionEmbarque?.Estado.Descripcion ?? estado,
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
				FechaLineUp = nominaciones.FirstOrDefault()?.FechaEnvioLineUp ?? null,
				FechaOperaciones = lineup.PlanoDeCarga?.FechaDeCreacion ?? null,
				FechaCalidad = lineup.ModuloDeCarga?.FechaDeCreacion ?? null,
				FechaZarpado = lineup.ModuloDeCarga?.FechaZarpado ?? null,
				FechaFacturado = lineup.Embarque?.AdministracionEmbarque?.FechaFacturado ?? null,
			};
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
			DateTime primerDia = new DateTime(periodo.Year, periodo.Month, 1);
			DateTime ultimoDia = primerDia.AddMonths(1).AddDays(-1);
			var muelle = _repositorio.Obtener<MuelleDeCarga>(m => m.Id == muelleId);
			var descripcion = muelle.Descripcion?.ToLowerInvariant();

			var embarquesFAS = new HashSet<int>(
			_repositorio.Listar<Nominacion>(n =>
				n.NominacionDatoTecnico.TipoDeContrato.Descripcion == "FAS" &&
				n.NominacionDatoTecnico.ObligacionDeCarga != null &&
				n.NominacionDatoTecnico.ObligacionDeCarga.Value <= ultimoDia &&
				n.NominacionDatoTecnico.ObligacionDeCarga.Value >= primerDia &&
				n.FechaEnvioLineUp != null &&
				n.FechaEliminacion == null)
			.Select(x => x.Embarque.Id));

			if (muelle == null)
				throw new InvalidOperationException("El muelle no fue encontrado.");

			var nominaciones = _repositorio.Incluir<Nominacion>().Where(
				n => n.NominacionDatoTecnico.ObligacionDeCarga.Value <= ultimoDia &&
				n.NominacionDatoTecnico.ObligacionDeCarga.Value >= primerDia &&
				n.FechaEliminacion == null);

			var embarques = nominaciones
				.SelectMany(n => n.Embarques.Select(ne => ne.Embarque))
				.Union(nominaciones.Select(n => n.Embarque))
				.Where(e => e != null &&
					(
						(descripcion == "san benito" && e.SanBenito) ||
						(descripcion == "nouryon" && e.Noryon) ||
						(descripcion == "vicentin" && e.Vicentin) ||
						(descripcion != "san benito" && descripcion != "nouryon" && descripcion != "vicentin" && e.OtrosMuelles)
					) &&
					!embarquesFAS.Contains(e.Id)
					&& e.Ubicacion == 1)
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

		private IList<CargaPorProductoExportadorDto> ObtenerCargasSolido(EmbarqueDto e)
		{
			var lineup = this._repositorio.Obtener<LineUp>(l => l.Embarque.Id == e.Id);
			return _conversor.ConvertirList<ModuloDeCargaPlanillaDeTurnosDetallesSolido, ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto>(
					lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(z => z.ModuloDeCargaPlanillaDeTurnosDetallesSolido).ToList())
				.Select(y => new CargaPorProductoExportadorDto
				{
					MaterialPuerto = y.MaterialPuerto,
					Exportador = y.Exportador,
					Cantidad = (decimal)y.Cantidad / 1000
				}).ToList();
		}

		private IList<CargaPorProductoExportadorDto> ObtenerCargasLiquido(EmbarqueDto e)
		{
			var lineup = this._repositorio.Obtener<LineUp>(l => l.Embarque.Id == e.Id);
			return _conversor.ConvertirList<ModuloDeCargaPlanillaDeTurnosDetallesLiquido, ModuloDeCargaPlanillaDeTurnosDetallesLiquidoDto>(
					lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(z => z.ModuloDeCargaPlanillaDeTurnosDetallesLiquido).ToList())
				.Select(y => new CargaPorProductoExportadorDto
				{
					MaterialPuerto = y.MaterialPuerto,
					Exportador = y.Exportador,
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

		public IList<TipoContratoTarifaDto> ListarTipoContratoTarifa()
		{
			return Listar<TipoContratoTarifa, TipoContratoTarifaDto>();
		}

		public CombosConsultaProvisionesDto ObtenerCombosProvisiones()
		{
			var response = new CombosConsultaProvisionesDto
			{
				Muelles = _servicioRepositorio.ListarMuelles().ToList(),
				Exportadores = _servicioRepositorio.ListaExportadores().ToList(),
				Productos = _servicioRepositorio.ListaMaterialesPuerto().ToList(),
				TiposContrato = this.ListarTipoContratoTarifa().ToList(),
			};
			return response;
		}

		public AltaProvisionYGastoDto ObtenerProvision(int? muelleId, DateTime periodo, int? embarqueId, int? productoId, int? exportadorId, int? contratoId)
		{
			AltaProvisionYGastoDto altaProvision = null;
			InfoFiltrada infoFiltrada = new InfoFiltrada
			{
				Buques = new List<string>(),
				Materiales = new List<string>()
			};
			var tarifas = _repositorio.Listar<TarifaPorEmbarque>(t =>
			t.Periodo == periodo && t.Cerrado == true);

			if (muelleId != null)
			{
				var muelle = this._repositorio.Obtener<MuelleDeCarga>(muelleId);
				tarifas = tarifas.Where(t =>
				(muelle.Descripcion == "San Benito" && t.Embarque.SanBenito) ||
				(muelle.Descripcion == "Vicentin" && t.Embarque.Vicentin) ||
				(muelle.Descripcion == "Nouryon" && t.Embarque.Noryon) ||
				(muelle.Descripcion == "Otros Muelles" && t.Embarque.OtrosMuelles)).ToList();
			}

			if (embarqueId != null)
			{
				tarifas = tarifas.Where(t => t.Embarque.Id == embarqueId).ToList();
			}

			if (exportadorId != null)
			{
				tarifas = tarifas.Where(t => t.Exportador.Id == exportadorId).ToList();
			}

			if (productoId != null)
			{
				tarifas = tarifas.Where(t => t.MaterialPuerto.Id == productoId).ToList();
			}

			if (contratoId != null)
			{
				tarifas = tarifas.Where(t => t.TipoContratoTarifa != null && t.TipoContratoTarifa.Id == contratoId).ToList();
			}

			infoFiltrada.Buques = tarifas
				.Where(t => t.Embarque != null && t.Embarque.Patente != null)
				.Select(t => t.Embarque.Patente)
				.Distinct()
				.ToList();
			infoFiltrada.Materiales = tarifas.Select(t => t.MaterialPuerto.Descripcion).Distinct().ToList();
			infoFiltrada.Tn = ObtenerTnTotales(tarifas);

			//Si se filtra una tarifa en particular -> Se puede editar.
			if (tarifas.Count() == 1)
			{
				var tarifa = tarifas.FirstOrDefault();
				altaProvision = this.ObtenerAltaProvision(tarifa);
				altaProvision.IdsTarifas = new List<int>();
				altaProvision.IdsTarifas.Add(tarifa.Id);
			}
			else //Caso contrario que se filtren mas de 1 tarifa devolvemos un dto que contemple el total de los conceptos de las tarifas
			{
				altaProvision = this.ObtenerProvisionVisualizar(tarifas.ToList());
				altaProvision.IdsTarifas = new List<int>();
				altaProvision.IdsTarifas.AddRange(tarifas.Select(t => t.Id).ToList());
			}

			altaProvision.InfoFiltrada = infoFiltrada;
			return altaProvision;
		}

		private decimal ObtenerTnTotales(IList<TarifaPorEmbarque> tarifas)
		{
			decimal tn = 0;
			foreach (var tarifa in tarifas)
			{
				var lineup = this._repositorio.Obtener<LineUp>(l => l.Embarque.Id == tarifa.Embarque.Id);
				var tnTarifa = this._servicioRepositorio.ObtenerTNEmbarqueProdExp(lineup, tarifa.MaterialPuerto.Id, tarifa.Exportador.Id);
				tn += tnTarifa;
			}
			return tn;
		}

		private AltaProvisionYGastoDto ObtenerAltaProvision(TarifaPorEmbarque tarifa)
		{
			bool confirmado = false;
			var provision = Obtener<ProvisionGasto, ProvisionGastoDto>(p => p.TarifaPorEmbarque.Id == tarifa.Id);
			var tarifaDto = _conversor.Convertir<TarifaPorEmbarque, TarifaPorEmbarqueDto>(tarifa);
			var altaProvision = new AltaProvisionYGastoDto
			{
				TarifaPorEmbarque = tarifaDto,
				ItemsProvision = new List<ItemProvisionDto>()
			};

			if (provision != null)
			{
				if (provision.FechaCierre.HasValue)
					confirmado = true;
				altaProvision.ProvisionId = provision.Id;
				altaProvision.ItemsProvision = provision.ProvisionGastoDetalle.Select(p => new ItemProvisionDto
				{
					Concepto = p.TarifaPorEmbarqueConcepto.Concepto,
					Valor = p.ValorAjustado > 0 ? p.ValorAjustado : p.ValorCalculado,
				}).ToList();
			}
			else
			{
				foreach (TarifaPorEmbarqueConcepto concepto in tarifa.TarifaPorEmbarqueConcepto)
				{
					var item = new ItemProvisionDto
					{
						Concepto = _conversor.Convertir<Concepto, ConceptoDto>(concepto.Concepto),
						Valor = this._servicioRepositorio.ObtenerValorCalculado(concepto),
					};
					altaProvision.ItemsProvision.Add(item);
				}
			}
			altaProvision.Confirmado = confirmado;
			return altaProvision;
		}

		private AltaProvisionYGastoDto ObtenerProvisionVisualizar(List<TarifaPorEmbarque> tarifas)
		{
			AltaProvisionYGastoDto totalizador = new AltaProvisionYGastoDto
			{
				ProvisionId = 0,
				TarifaPorEmbarque = null,
				ItemsProvision = new List<ItemProvisionDto>()
			};
			var allConceptos = Listar<Concepto, ConceptoDto>();

			var tarifaIds = tarifas.Select(t => t.Id).ToList();
			var confirmado = this._repositorio.Listar<ProvisionGasto>(p => tarifaIds.Contains(p.TarifaPorEmbarque.Id)).All(y => y.FechaCierre.HasValue);

			foreach (var concepto in allConceptos)
			{
				var itemProvision = new ItemProvisionDto
				{
					Concepto = concepto,
				};
				var conceptosTarifa = tarifas.SelectMany(t => t.TarifaPorEmbarqueConcepto).Where(x => x.Concepto.Id == concepto.Id);
				itemProvision.Valor = 0;
				foreach (var ct in conceptosTarifa)
				{
					var provisionBd = this._repositorio.Obtener<ProvisionGastoDetalle>(d => d.TarifaPorEmbarqueConcepto.Id == ct.Id);
					if (provisionBd != null)
					{
						itemProvision.Valor += provisionBd.ValorAjustado > 0 ? provisionBd.ValorAjustado : provisionBd.ValorCalculado;
					}
					else
					{
						//Si no existe el registro en provision -> nunca se provisiono, por ende nunca se confirmo.
						confirmado = false;
						itemProvision.Valor += this._servicioRepositorio.ObtenerValorCalculado(ct);
					}
				}

				itemProvision.Valor = Math.Round(itemProvision.Valor, 2, MidpointRounding.AwayFromZero);
				totalizador.ItemsProvision.Add(itemProvision);
			}

			totalizador.Confirmado = confirmado;
			return totalizador;
		}

		public List<TarifaPorEmbarqueDto> ListarTarifasIds(List<int> ids)
		{
			var tarifas = Listar<TarifaPorEmbarque, TarifaPorEmbarqueDto>(t => ids.Contains(t.Id)).ToList();
			foreach (var tarifa in tarifas)
			{
				var lineup = this._repositorio.Obtener<LineUp>(l => l.Embarque.Id == tarifa.Embarque.Id);
				tarifa.Tn = _servicioRepositorio.ObtenerTNEmbarqueProdExp(lineup, tarifa.MaterialPuerto.Id, tarifa.Exportador.Id);
				foreach (var tc in tarifa.TarifaPorEmbarqueConcepto)
				{
					var tcBd = this._repositorio.Obtener<TarifaPorEmbarqueConcepto>(x => x.Id == tc.Id);
					var valorCalculado = this._servicioRepositorio.ObtenerValorCalculado(tcBd);
					tc.ValorCalculado = valorCalculado;
				}
			}
			return tarifas;
		}

		public List<ProvisionGastoDto> ListarProvisionesDadaTarifasIds(List<int> ids)
		{
			var provisiones = Listar<ProvisionGasto, ProvisionGastoDto>(t => ids.Contains(t.TarifaPorEmbarque.Id)).ToList();
			return provisiones;
		}

		public List<LineUpDto> ListarLineUpDadoEmbarqueIds(List<int> idsEmbarque)
		{
			var lineups = Listar<LineUp, LineUpDto>(l => idsEmbarque.Contains(l.Embarque.Id)).ToList();
			return lineups;
		}

		public List<NominacionDto> ListarNominacionesDadoEmbarqueIds(List<int> idsEmbarque)
		{
			var nominaciones = Listar<Nominacion, NominacionDto>(n => idsEmbarque.Contains(n.Embarque.Id) && n.FechaEliminacion == null).ToList();
			var nomEmb = this._repositorio.Listar<NominacionEmbarque>(n => idsEmbarque.Contains(n.Embarque.Id) && n.Nominacion.FechaEliminacion == null).Select(x => x.Nominacion).ToList();
			var nomDto = _conversor.ConvertirList<Nominacion, NominacionDto>(nomEmb).ToList();
			return nominaciones.Concat(nomDto).Distinct().ToList();
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
					// 2 años antes
					periodo.Add(hoy.AddMonths(-i));
				}

				for (int i = 1; i <= 12; i++)
				{
					// 1 año despues
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

		public void GuardarTarifaCotizacionDolar(DateTime periodo, decimal valorDolar, string usuario)
		{
			try
			{
				if (valorDolar <= 0)
				{
					throw new InvalidOperationException("Debe ingresar un valor en la tarifa");
				}

				var fechaPeriodo = new DateTime(periodo.Year, periodo.Month, 1);

				var hoy = DateTime.Now;
				var mesAnterior = new DateTime(hoy.Year, hoy.Month, 1).AddMonths(-1);

				if (fechaPeriodo < mesAnterior)
				{
					throw new InvalidOperationException("No se puede editar períodos anteriores al mes anterior al actual");
				}

				var tarifaExistente = _repositorio.Obtener<TarifaCotizacionDolar>(
					tc => tc.Periodo == fechaPeriodo);

				if (tarifaExistente != null)
				{
					tarifaExistente.ValorDolar = valorDolar;
					tarifaExistente.FechaActualizacion = DateTime.Now;
					tarifaExistente.UsuarioActualizacion = usuario;

					var logAbm = new LogABM
					{
						Pantalla = "TarifaCotizacionDolar",
						Usuario = usuario,
						Fecha = DateTime.Now,
						Evento = EventoABM.Modificacion,
						Entidad = $"Tarifa Cotización Dólar Período: {periodo} - Valor: ${valorDolar}",
						ClaseId = tarifaExistente.Id
					};
					_repositorio.Agregar(logAbm);
				}
				else
				{
					var nuevaTarifa = new TarifaCotizacionDolar
					{
						Periodo = fechaPeriodo,
						ValorDolar = valorDolar,
						FechaActualizacion = DateTime.Now,
						UsuarioActualizacion = usuario
					};
					_repositorio.Agregar(nuevaTarifa);

					var logAbm = new LogABM
					{
						Pantalla = "TarifaCotizacionDolar",
						Usuario = usuario,
						Fecha = DateTime.Now,
						Evento = EventoABM.Alta,
						Entidad = $"Tarifa Cotización Dólar Período: {periodo} - Valor: ${valorDolar}",
						ClaseId = nuevaTarifa.Id
					};
					_repositorio.Agregar(logAbm);
				}

				_repositorio.GuardarCambios();
			}
			catch (Exception ex)
			{
				_log.Error($"Error guardando tarifa de cotización dólar para período {periodo}", ex);
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
			return _conversor.ConvertirListaPaginada<Acuerdo, AcuerdoDto>(resultado);
		}

		public void EliminarAcuerdo(int acuerdoId, string usuarioEliminacion)
		{
			var acuerdo = _repositorio.Obtener<Acuerdo>(acuerdoId) ?? throw new InvalidOperationException("No se encuentra el acuerdo con el id especificado.");
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
		}

		public void DesasociarEmbarcacionConAcuerdo(int idAcuerdoEmbarque, string usuario)
		{
			var vinculo = _repositorio.Obtener<AcuerdoEmbarque>(idAcuerdoEmbarque);
			if (vinculo != null)
			{
				string entidadLog = string.Format("Desasociación AcuerdoDetalle ID: {0} - Embarque ID: {1}",
					vinculo.AcuerdoDetalle.Id, vinculo.Embarque.Id);

				var logAbm = new LogABM
				{
					Pantalla = "AcuerdosPorEmbarcacion",
					Usuario = usuario,
					Fecha = DateTime.Now,
					Evento = EventoABM.Baja,
					Entidad = entidadLog,
					ClaseId = vinculo.Id
				};
				_repositorio.Agregar(logAbm);

				_repositorio.Remover(vinculo);
				_repositorio.GuardarCambios();
			}
		}

		public void EditarAsociacionEmbarcacionConAcuerdo(int idAcuerdoEmbarque, decimal nuevaCantidad, string usuario)
		{
			var vinculo = _repositorio.Obtener<AcuerdoEmbarque>(idAcuerdoEmbarque);

			if (vinculo == null)
			{
				throw new Exception("No se encontró la asociación del acuerdo.");
			}

			var cantidadAnterior = vinculo.Cantidad;
			vinculo.Cantidad = nuevaCantidad;

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
		}

		#endregion
	}
}