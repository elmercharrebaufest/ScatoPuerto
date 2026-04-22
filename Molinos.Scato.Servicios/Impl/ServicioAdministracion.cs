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
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using static Molinos.Scato.Dominio.Constantes;

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
				Muelles = this.ListarMuelles().ToList(),
				Agencias = _servicioRepositorio.ListarAgenciasMaritimas().ToList(),
				Exportadores = _servicioRepositorio.ListaExportadores().ToList(),
				Clientes = _servicioRepositorio.ListarCoordinadores().ToList(),
				Productos = _servicioRepositorio.ListaMaterialesPuerto().ToList()
			};
			return response;
		}

        public IList<MuelleDto> ListarMuelles()
        {
            return Listar<Muelle, MuelleDto>();
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

            var nominaciones = ObtenerNominaciones(embarqueId) ?? new List<Nominacion>();
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
            var infoBuque = ObtenerInformacionBuque(cargas, nominaciones, lineup.PlanoDeCarga, lineup.Embarque.SanBenito);

			var tieneFumPrevNominacion = nominaciones.Any(x => x.NominacionDetalleIntervencion?.Fumigacion == "Si");

			if (estadoBd.Descripcion.Equals("Lineup", StringComparison.OrdinalIgnoreCase))
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
            var embarque = lineup.Embarque;
			var admEmbarque = _repositorio.Obtener<AdministracionEmbarque>(e => e.Embarque.Id == lineup.Embarque.Id);
			var estadoEmbarque = admEmbarque?.EstadoEmbarque;

			if (embarque.OtrosMuelles)
            {
                var tieneCargas = embarque?.OtroMuelleCarga?.OtroMuelleCargaDetalles?.Any() == true;

                if (embarque.Ubicacion == 1) return "A Facturar";

                if (!tieneCargas) return "LineUp";

                /*if (embarque) return "Facturado";*/

                return "Operaciones";
            } 
			else if (estadoEmbarque != null)
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
			var embarque = lineup.Embarque;

			if (embarque.OtrosMuelles)
			{
				if (embarque.OtroMuelleCarga != null && embarque.OtroMuelleCarga.OtroMuelleCargaDetalles.Any())
				{
					return embarque.OtroMuelleCarga.OtroMuelleCargaDetalles.Cast<object>();
				}
				return Enumerable.Empty<object>();
			}

			if (embarque.EsLiquido)
			{
				return lineup.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos?
					.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido.Cast<object>())
					?? Enumerable.Empty<object>();
			}
			else
			{
				return lineup.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos?
					.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Cast<object>())
					?? Enumerable.Empty<object>();
			}
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
				MuelleId = lineup.Embarque.Muelle != null ? lineup.Embarque.Muelle.Id : 0,
				OtroMuelleNombre = lineup.Embarque.OtroMuelleNombre,
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
            var usoPala = lineup.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos?.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad).Any() ?? false;

            // Obtener fechas de amarre y desamarre según muelle
            DateTime? amarre = lineup.Embarque.OtrosMuelles
                ? lineup.Embarque.OtroMuelleCarga?.OtroMuelleCargaDetalles.Min(x => x.FechaHoraInicio)
                : periodoDeCarga?.FechaAmarro ?? amarreNominacion;

            DateTime? desamarre = lineup.Embarque.OtrosMuelles
                ? lineup.Embarque.OtroMuelleCarga?.OtroMuelleCargaDetalles.Max(x => x.FechaHoraFin)
                : periodoDeCarga?.FechaDesamarro;

            string horaAmarre = lineup.Embarque.OtrosMuelles
                ? amarre?.ToString("HH:mm")
                : periodoDeCarga?.HoraAmarro ?? "";

            string horaDesamarre = lineup.Embarque.OtrosMuelles
                ? desamarre?.ToString("HH:mm")
                : periodoDeCarga?.HoraDesamarro ?? amarreNominacion?.ToString("HH:mm");


            var tieneFumPrev = lineup.Embarque.OtrosMuelles
                ? lineup.Embarque.OtroMuelleCarga.FumigacionPreventiva
                : lineup.Embarque.EsLiquido
                ? false
                : (lineup.PlanoDeCarga?.PlanoDeCargaBodega?.Any(x => x.FumPreventiva == true) ?? false);
            var tieneFumCur = lineup.Embarque.OtrosMuelles
                ? lineup.Embarque.OtroMuelleCarga.FumigacionCurativa
                : lineup.Embarque.EsLiquido
                ? false
                : (lineup.PlanoDeCarga?.PlanoDeCargaBodega?.Any(x => x.FumCurativa == true) ?? false);

            var tieneSenasa = lineup.Embarque.OtrosMuelles
                ? lineup.Embarque.OtroMuelleCarga.Senasa
                : nominaciones.Any(x => x.NominacionDetalleIntervencion?.Senasa?.Any(s => s.TieneSenasa) == true);


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
                Senasa = tieneSenasa,
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
				MuelleId = lineup.Embarque.Muelle != null ? lineup.Embarque.Muelle.Id : 0,
				OtroMuelleNombre = lineup.Embarque.OtroMuelleNombre,
				FechaLineUp = nominaciones.FirstOrDefault()?.FechaEnvioLineUp ?? null,
                FechaOperaciones = lineup.PlanoDeCarga?.FechaDeCreacion ?? null,
                FechaCalidad = lineup.ModuloDeCarga?.FechaDeCreacion ?? null,
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
				(x.Id != 77) && x.Habilitado;

			Func<ExportadorDto, bool> condicionEsMOA = x =>
				x.Id == 77 && x.Habilitado;

			var tieneAlgunExportadorDistintoDeMOA = exportadoresNominacion.Any(condicionDistintoDeMOA);
			var todosLosExportadoresSonMOA = exportadoresNominacion.All(condicionEsMOA);


			return (embarque.SanBenito && tieneAlgunExportadorDistintoDeMOA) ||
				   (!embarque.SanBenito && todosLosExportadoresSonMOA);
		}

		private List<InformacionBuqueDto> ObtenerInformacionBuque(IEnumerable<object> cargas, List<Nominacion> nominaciones, PlanoDeCarga plano, bool esSanBenito)
		{
			var informacionBuqueList = new List<InformacionBuqueDto>();

            if (cargas.OfType<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>().Any())
            {
                var cargasLiquido = cargas.OfType<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>();
                var cargasLiquidoIds = cargasLiquido.Select(z => z.Linea_Id).ToList();

                var lineasVN = esSanBenito? new List<TipoLineaEmbarque>() : this._repositorio.Listar<TipoLineaEmbarque>(x => cargasLiquidoIds.Contains(x.Id));

                var lineasLiquido = esSanBenito? this._repositorio.Listar<ModuloDeCargaLineasDeEmbarque>(x => cargasLiquidoIds.Contains(x.Id)) : new List<ModuloDeCargaLineasDeEmbarque>();

                var agrupadoLiquido = cargasLiquido
                    .GroupBy(c => new { c.Exportador, c.MaterialPuerto, c.Tk,
                        TipoLineaEmbarque = esSanBenito
                        ? lineasLiquido.FirstOrDefault(l => l.Id == c.Linea_Id)?.TipoLineaEmbarque.Linea
                        : lineasVN.FirstOrDefault(l => l.Id == c.Linea_Id)?.Linea
                    })
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
                        TanqueOrigen = item.TipoLineaEmbarque?? string.Empty,
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
            else {
                if (cargas.Any(x => x is OtroMuelleCargaDetalle))
                {
                    var cargasOtrosDetalle = cargas.Cast<OtroMuelleCargaDetalle>();

                    var cargaOtros = cargasOtrosDetalle.FirstOrDefault()?.OtroMuelleCarga;
                
                    var detalle = cargasOtrosDetalle
                        .Select(c => new 
                        {
                            c.Exportador,
                            c.MaterialPuerto,
                            TotalCantidad = c.CantidadTn
                        });

                    foreach (var item in detalle)
                    {             
                        var acuentaSenasa = cargaOtros.Senasa ? "Si" : "No";              

                        var acuentaFumigacion = (cargaOtros.FumigacionPreventiva || cargaOtros.FumigacionCurativa)
                            ? "Si" : "No";                        

                        var infoBuque = new InformacionBuqueDto
                        {
                            Exportador = item.Exportador.Nombre,
                            MaterialPuerto = item.MaterialPuerto.Descripcion,
                            Tn = item.TotalCantidad,
                            ACuentaSenasa = acuentaSenasa,
                            ACuentaFumigacion = acuentaFumigacion
                        };

                        informacionBuqueList.Add(infoBuque);
                    }
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

			var embarqueEntidad = _conversor.Convertir<EmbarqueDto, Embarque>(embarqueATarifar.Embarque);
			embarqueATarifar.Cargas = !embarqueATarifar.Embarque.SanBenito ? ObtenerCargasOtrosMuelles(embarqueEntidad) :
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
			var exportadorMOA = _repositorio.Obtener<Exportador>(e => e.Id == 77 && e.Habilitado);
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

		public List<AcuerdoVinculadoDto> ObtenerAcuerdosVinculados(List<int> embarquesIds)
		{
			if (embarquesIds == null || !embarquesIds.Any())
				return new List<AcuerdoVinculadoDto>();

			var vinculados = _repositorio.Listar<AcuerdoEmbarque>(ae => embarquesIds.Contains(ae.Embarque.Id)).ToList();

			return vinculados.Select(ae => new AcuerdoVinculadoDto
			{
				EmbarqueId = ae.Embarque.Id,
				AcuerdoId = ae.AcuerdoDetalle.Acuerdo.Id,
				MaterialId = ae.AcuerdoDetalle.MaterialPuerto.Id
			}).ToList();
		}

		public IList<EmbarqueATarifarDto> ListarEmbarquesATarifar(DateTime periodo, int muelleId)
		{
			var lineups = ObtenerLineUpsValidos(periodo, muelleId);

			var embarques = lineups
				.Select(l => l.Embarque)
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
				var embarqueEntidad = _conversor.Convertir<EmbarqueDto, Embarque>(embarque.Embarque);
				embarque.Cargas = !embarque.Embarque.SanBenito ? ObtenerCargasOtrosMuelles(embarqueEntidad) :
							 embarque.Embarque.EsLiquido ? ObtenerCargasLiquido(embarque.Embarque) : ObtenerCargasSolido(embarque.Embarque);
			}

			return embarquesATarifar;
		}

		private List<LineUp> ObtenerLineUpsValidos(DateTime periodo, int muelleId)
		{
			var nominacionesActivas = _repositorio.Incluir<Nominacion>()
				.Where(n => n.FechaEliminacion == null);

			var embarquesValidosIds = nominacionesActivas
				.SelectMany(n => n.Embarques.Select(ne => ne.Embarque))
				.Union(nominacionesActivas.Select(n => n.Embarque))
				.Where(e => e != null)
				.Select(e => e.Id)
				.Distinct()
				.ToList();

			var lineupsCandidatos = _repositorio.Incluir<LineUp>()
				.Where(l => l.Embarque.Ubicacion == 1 &&
							embarquesValidosIds.Contains(l.Embarque.Id))
				.ToList();

			return lineupsCandidatos
				.Where(l =>
				{
					bool cumpleFiltroMuelle = muelleId == 0 ||
						(l.Embarque.Muelle == null && (
							(muelleId == 1 && l.Embarque.SanBenito) ||
							(muelleId == 2 && l.Embarque.Vicentin) ||
							(muelleId == 3 && l.Embarque.Noryon) ||
							(muelleId == 7 && l.Embarque.OtrosMuelles)
						)) ||
						(l.Embarque.Muelle != null && l.Embarque.Muelle.Id == muelleId) ||
						CompararMuelles(l.Embarque, muelleId);

					if (!cumpleFiltroMuelle)
					{
						return false;
					}

					if (l.Embarque.OtrosMuelles)
					{
						// Otros Muelles, la fecha se encuentra en los detalles
						if (l.Embarque.OtroMuelleCarga != null && l.Embarque.OtroMuelleCarga.OtroMuelleCargaDetalles.Any())
						{
							var maxFechaFin = l.Embarque.OtroMuelleCarga.OtroMuelleCargaDetalles.Max(d => d.FechaHoraFin);
							return maxFechaFin.Year == periodo.Year && maxFechaFin.Month == periodo.Month;
						}
					}
					else
					{
						// Para el resto la fecha de desamarre se encuentra en ModuloDeCarga
						if (l.ModuloDeCarga != null)
						{
							return l.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.Any(p =>
								p.FechaDesamarro != null &&
								p.FechaDesamarro.Value.Year == periodo.Year &&
								p.FechaDesamarro.Value.Month == periodo.Month);
						}
					}

					return false;
				})
				.ToList();
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
			var muelles = this.ListarMuelles().ToList();
			var materialesPuerto = Listar<MaterialPuerto, MaterialPuertoDto>(x => x.DescripcionCorta != null && x.Activo).ToList();
			if (conBuques)
			{
				buques = _servicioRepositorio.ObtenerVaporesUsados().ToList();
			}

			var idSanBenito = muelles.FirstOrDefault(e => e.Descripcion == "San Benito")?.Id ?? throw new Exception("No se encuentra el muelle 'San Benito' en la base de datos");
			var idMOA = exportadores.FirstOrDefault(e => e.Id == 77 && e.Habilitado)?.Id ?? throw new Exception("No se encuentra el exportador 'MOLINOS AGRO SA' en la base de datos");

			return new AcuerdoCombosDto
			{
				Tipos = Listar<AcuerdoTipo, AcuerdoTipoDto>().ToList(),
				Muelles = muelles,
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

		public ListaPaginada<AcuerdoPorEmbarcacionDto> ListarAcuerdoPorEmbarcacion(int idEmbarque, bool filtrarPorEmbarque, Paginacion paginacion, FiltrosAcuerdoPorEmbarcacionDto filtros)
		{
			var detalle = ObtenerDetalleEmbarque(idEmbarque);

			var nombreExportadorMOA = _repositorio.Obtener<Exportador>(e => e.Id == 77 && e.Habilitado)?.Nombre;
			var cargasValidas = detalle.MuelleId == 1 // San Benito
 								? detalle.Cargas.Where(c => c.Exportador != nombreExportadorMOA).ToList()
								: detalle.Cargas.ToList();
			var productosPermitidos = cargasValidas.Select(c => c.MaterialPuerto).Distinct().ToList();
			var exportadoresPermitidos = cargasValidas.Select(e => e.Exportador).Distinct().ToList();

			var muellePermitidoId = detalle.MuelleId;

			var totalTnTerceros = cargasValidas.Sum(c => c.Tn);
			var cargasPorProductoExportador = cargasValidas
				.GroupBy(c => new { c.Exportador, c.MaterialPuerto })
				.ToDictionary(
					g => $"{g.Key.Exportador}|{g.Key.MaterialPuerto}",
					g => g.Sum(c => c.Tn)
				);

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
				muellePermitidoId,
				totalTnTerceros,
				filtrarPorEmbarque,
				cargasPorProductoExportador
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
				(embarque.SanBenito && c.Exportador.Id != 77) ||
				(!embarque.SanBenito && c.Exportador.Id == 77)
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
		/// Evalúa si un embarque cumple con el 100% de los requisitos tarifarios 
		/// (Terceros por Acuerdos + MOA por Tarifa Por Producto) para transicionar a "Aplicado".
		/// </summary>
		public void EvaluarEstadoAplicadoParaEmbarque(int embarqueId, string usuario)
		{
			var embarque = _repositorio.Obtener<Embarque>(e => e.Id == embarqueId);
			if (embarque == null || embarque.Ubicacion != 1) return;

			var admEmbarque = _repositorio.Obtener<AdministracionEmbarque>(e => e.Embarque.Id == embarqueId);
			if (admEmbarque?.EstadoEmbarque?.Id == (int)EstadoEmbarqueEnum.Facturado ||
				admEmbarque?.EstadoEmbarque?.Id == (int)EstadoEmbarqueEnum.Aplicado) return;

			// TODO: para cuando se realice el merge con Otros Muelles
			// para averiguar la fecha que se toma para el periodo se debe de tomar por:
			// Embarque.OtroMuelleCarga.OtroMuelleCargaDetalle.FechaHoraFin
			var lineup = _repositorio.Obtener<LineUp>(l => l.Embarque.Id == embarqueId);
			var periodoCarga = lineup?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga.FirstOrDefault(p => p.FechaDesamarro != null);
			if (periodoCarga?.FechaDesamarro == null) return;

			var fechaDesamarre = periodoCarga.FechaDesamarro.Value;
			var periodoPeriodo = new DateTime(fechaDesamarre.Year, fechaDesamarre.Month, 1);

			// Obtenemos todo el detalle de cargas del buque
			var detalleATarifar = ObtenerDetalleEmbATarifar(embarqueId);
			if (detalleATarifar == null || detalleATarifar.Cargas == null || !detalleATarifar.Cargas.Any()) return;

			bool tieneCargaTerceros = false;
			bool tieneCargaMOA = false;

			// ===============================================================================
			// 1. EVALUAR ACUERDOS
			// ===============================================================================
			var cargasTercerosRequeridas = detalleATarifar.Cargas.Where(c =>
				(embarque.SanBenito && c.Exportador.Id != 77) ||
				(!embarque.SanBenito)
			).ToList();

			if (cargasTercerosRequeridas.Any())
			{
				tieneCargaTerceros = true;

				var cargaRequeridaPorProducto = cargasTercerosRequeridas
					.GroupBy(c => c.MaterialPuerto.Id)
					.ToDictionary(g => g.Key, g => g.Sum(c => c.Cantidad));

				var acuerdosAsociados = _repositorio.Listar<AcuerdoEmbarque>(ae => ae.Embarque.Id == embarqueId).ToList();

				foreach (var req in cargaRequeridaPorProducto)
				{
					decimal cantidadAsociada = acuerdosAsociados
						.Where(ae => ae.AcuerdoDetalle.MaterialPuerto.Id == req.Key)
						.Sum(ae => ae.Cantidad);

					if (cantidadAsociada < req.Value) return;
				}

				if (!acuerdosAsociados.Any()) return;

				foreach (var acuerdoEmbarque in acuerdosAsociados)
				{
					var conceptosIds = acuerdoEmbarque.AcuerdoDetalle.AcuerdoDetalleConceptos.Select(c => c.Id).ToList();
					if (!conceptosIds.Any()) return;

					var periodoAcuerdo = _repositorio.ObtenerPrimero<AcuerdoPeriodo>(p =>
						p.Periodo == periodoPeriodo &&
						p.AcuerdoDetalleConceptoPeriodoTarifas.Any(t => conceptosIds.Contains(t.AcuerdoDetalleConcepto.Id))
					);

					if (periodoAcuerdo == null || !periodoAcuerdo.Cerrado) return; // Hay acuerdos sin cerrar
				}
			}

			// ===============================================================================
			// 2. EVALUAR TARIFA POR PRODUCTO
			// ===============================================================================
			if (embarque.SanBenito)
			{
				var cargasMOA = detalleATarifar.Cargas.Where(c => c.Exportador.Id == 77).ToList();
				if (cargasMOA.Any())
				{
					tieneCargaMOA = true;
					var productosMOA = cargasMOA.Select(c => c.MaterialPuerto.Id).Distinct().ToList();

					foreach (var prodId in productosMOA)
					{
						var tarifaProducto = _repositorio.Obtener<TarifaPorProducto>(t =>
							t.MaterialPuerto.Id == prodId &&
							t.Periodo == periodoPeriodo);

						if (tarifaProducto == null || !tarifaProducto.Cerrado) return; // Tarifa pizarra abierta
					}
				}
			}

			// Si llegó hasta aquí, significa que el 100% de la carga (sea de MOA, de terceros o mixta) está CERRADA.
			if (tieneCargaTerceros || tieneCargaMOA)
			{
				TransicionarAAplicado(embarque, usuario);
			}
		}

		/// <summary>
		/// Se ejecuta cuando ocurre el cierre de Tarifa por Producto de MOA
		/// </summary>
		public void EvaluarEstadoAplicadoPorCierreTarifaProducto(int productoId, DateTime periodo, string usuario)
		{
			var periodoFecha = new DateTime(periodo.Year, periodo.Month, 1);
			var exportadorMOA = _repositorio.Obtener<Exportador>(e => e.Id == 77 && e.Habilitado);
			if (exportadorMOA == null) return;

			var lineups = _repositorio.Listar<LineUp>(l =>
				l.Embarque.SanBenito &&
				l.Embarque.Ubicacion == 1 &&
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
				if (productosEmbarque.Contains(productoId))
				{
					// Ejecutamos la nueva evaluación integral (Acuerdos + MOA)
					EvaluarEstadoAplicadoParaEmbarque(lineup.Embarque.Id, usuario);
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

		private void TransicionarAAplicado(Embarque embarque, string usuario)
		{
			var estadoAplicado = _repositorio.Obtener<EstadoEmbarque>(e => e.Id == (int)EstadoEmbarqueEnum.Aplicado);
			if (estadoAplicado == null) return;

			var admEmbarque = _repositorio.Obtener<AdministracionEmbarque>(e => e.Embarque.Id == embarque.Id);
			var estadoFacturado = _repositorio.Obtener<EstadoEmbarque>(e => e.Id == (int)EstadoEmbarqueEnum.Facturado);

			if (admEmbarque?.EstadoEmbarque?.Id == estadoFacturado?.Id) return;
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
		/// Evalúa si un buque ya con el estado Aplicado dejó de cumplir el 100%
		/// de los requisitos debido a una reapertura, y lo devuelve a "A Facturar".
		/// </summary>
		private void RevertirDesdeAplicadoSiCorresponde(int embarqueId, string usuario)
		{
			var admEmbarque = _repositorio.Obtener<AdministracionEmbarque>(e => e.Embarque.Id == embarqueId);
			if (admEmbarque == null || admEmbarque.EstadoEmbarque?.Id != (int)EstadoEmbarqueEnum.Aplicado) return;

			var embarque = admEmbarque.Embarque;
			var lineup = _repositorio.Obtener<LineUp>(l => l.Embarque.Id == embarqueId);
			var periodoCarga = lineup?.ModuloDeCarga?.ModuloDeCargaPeriodoDeCarga.FirstOrDefault(p => p.FechaDesamarro != null);
			if (periodoCarga?.FechaDesamarro == null) return;

			var fechaDesamarre = periodoCarga.FechaDesamarro.Value;
			var periodoPeriodo = new DateTime(fechaDesamarre.Year, fechaDesamarre.Month, 1);

			var detalleATarifar = ObtenerDetalleEmbATarifar(embarqueId);
			if (detalleATarifar == null || detalleATarifar.Cargas == null) return;

			bool sigueCumpliendoTodo = true;

			var cargasTercerosRequeridas = detalleATarifar.Cargas.Where(c =>
				(embarque.SanBenito && c.Exportador.Id != 77) ||
				(!embarque.SanBenito)
			).ToList();

			if (cargasTercerosRequeridas.Any())
			{
				var cargaRequeridaPorProducto = cargasTercerosRequeridas
					.GroupBy(c => c.MaterialPuerto.Id)
					.ToDictionary(g => g.Key, g => g.Sum(c => c.Cantidad));

				var acuerdosAsociados = _repositorio.Listar<AcuerdoEmbarque>(ae => ae.Embarque.Id == embarqueId).ToList();

				foreach (var req in cargaRequeridaPorProducto)
				{
					decimal cantidadAsociada = acuerdosAsociados
						.Where(ae => ae.AcuerdoDetalle.MaterialPuerto.Id == req.Key)
						.Sum(ae => ae.Cantidad);

					if (cantidadAsociada < req.Value) { sigueCumpliendoTodo = false; break; }
				}

				if (sigueCumpliendoTodo)
				{
					if (!acuerdosAsociados.Any()) { sigueCumpliendoTodo = false; }
					else
					{
						foreach (var acuerdoEmbarque in acuerdosAsociados)
						{
							var conceptosIds = acuerdoEmbarque.AcuerdoDetalle.AcuerdoDetalleConceptos.Select(c => c.Id).ToList();
							if (!conceptosIds.Any()) { sigueCumpliendoTodo = false; break; }

							var periodoAcuerdo = _repositorio.ObtenerPrimero<AcuerdoPeriodo>(p =>
								p.Periodo == periodoPeriodo &&
								p.AcuerdoDetalleConceptoPeriodoTarifas.Any(t => conceptosIds.Contains(t.AcuerdoDetalleConcepto.Id))
							);

							if (periodoAcuerdo == null || !periodoAcuerdo.Cerrado) { sigueCumpliendoTodo = false; break; }
						}
					}
				}
			}

			if (sigueCumpliendoTodo && embarque.SanBenito)
			{
				var cargasMOA = detalleATarifar.Cargas.Where(c => c.Exportador.Id == 77).ToList();
				if (cargasMOA.Any())
				{
					var productosMOA = cargasMOA.Select(c => c.MaterialPuerto.Id).Distinct().ToList();
					foreach (var prodId in productosMOA)
					{
						var tarifaProducto = _repositorio.Obtener<TarifaPorProducto>(t =>
							t.MaterialPuerto.Id == prodId &&
							t.Periodo == periodoPeriodo);

						if (tarifaProducto == null || !tarifaProducto.Cerrado) { sigueCumpliendoTodo = false; break; }
					}
				}
			}

			if (!sigueCumpliendoTodo)
			{
				var estadoAFacturar = _repositorio.Obtener<EstadoEmbarque>(e => e.Id == (int)EstadoEmbarqueEnum.AFacturar);
				if (estadoAFacturar != null)
				{
					admEmbarque.EstadoEmbarque = estadoAFacturar;
					admEmbarque.FechaAplicado = null;

					var logAbm = new LogABM
					{
						Pantalla = "RevertirDesdeAplicado",
						Usuario = usuario,
						Fecha = DateTime.Now,
						Evento = EventoABM.Modificacion,
						Entidad = $"Embarque ID: {embarqueId} revertido de Aplicado a A Facturar por reapertura tarifaria",
						ClaseId = embarqueId
					};
					_repositorio.Agregar(logAbm);
					_repositorio.GuardarCambios();
				}
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

		private IList<CargaPorProductoExportadorDto> ObtenerCargasOtrosMuelles(Embarque embarque)
		{
			var cargasDto = new List<CargaPorProductoExportadorDto>();

			// Busqueda de las cargas reales para Acuerdos
			if (embarque.OtroMuelleCarga != null && embarque.OtroMuelleCarga.OtroMuelleCargaDetalles.Any())
			{
				var agrupado = embarque.OtroMuelleCarga.OtroMuelleCargaDetalles
					.GroupBy(d => new { d.MaterialPuerto, d.Exportador })
					.Select(g => new CargaPorProductoExportadorDto
					{
						MaterialPuerto = _conversor.Convertir<MaterialPuerto, MaterialPuertoDto>(g.Key.MaterialPuerto),
						Exportador = _conversor.Convertir<Exportador, ExportadorDto>(g.Key.Exportador),
						Cantidad = g.Sum(x => x.CantidadTn)
					}).ToList();

				return agrupado;
			}

			// Busqueda de nominaciones para Otros Muelles en caso de no tener cargas reales cargadas
			var nominaciones = ObtenerNominaciones(embarque.Id).Where(n => n.FechaEliminacion == null) ?? new List<Nominacion>();
			foreach (var nominacion in nominaciones)
			{
				var exportadores = nominacion.NominacionDatoTecnico?.NominacionDatoTecnicoExportador;
				if (exportadores != null)
				{
					foreach (var exportador in exportadores)
					{
						var cargaExistente = cargasDto.FirstOrDefault(c => c.MaterialPuerto.Id == nominacion.NominacionDatoTecnico.MaterialPuerto.Id && c.Exportador.Id == exportador.Exportador.Id);
						if (cargaExistente != null)
						{
							cargaExistente.Cantidad += exportador.Cantidad;
						}
						else
						{
							cargasDto.Add(new CargaPorProductoExportadorDto
							{
								MaterialPuerto = _conversor.Convertir<MaterialPuerto, MaterialPuertoDto>(nominacion.NominacionDatoTecnico.MaterialPuerto),
								Exportador = _conversor.Convertir<Exportador, ExportadorDto>(exportador.Exportador),
								Cantidad = exportador.Cantidad
							});
						}
					}
				}
			}

			return cargasDto;
		}

		public CombosConsultaProvisionesDto ObtenerCombosProvisiones()
		{
			var response = new CombosConsultaProvisionesDto
			{
				Muelles = this.ListarMuelles().ToList(),
				Exportadores = _servicioRepositorio.ListaExportadores().ToList(),
				Productos = _servicioRepositorio.ListaMaterialesPuerto().ToList(),
				Acuerdos = Listar<Acuerdo, AcuerdoDto>().ToList(),
			};
			return response;
		}

		public AltaProvisionYGastoDto ObtenerProvision(int? muelleId, DateTime periodo, int? embarqueId, int? productoId, int? exportadorId, int? acuerdoId)
		{
			var datosBase = ObtenerDatosBaseProvision(muelleId, periodo, embarqueId, productoId, exportadorId, acuerdoId);

			var altaProvision = ObtenerProvisionVisualizarCalculado(datosBase.TarifasAplicables, datosBase.CotizacionGlobal, datosBase.InfoFiltrada.TnPorBuque, datosBase.InfoFiltrada.AcuerdosPorBuque);

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
				Tn = 0,
				TnPorBuque = new Dictionary<string, decimal>(),
				AcuerdosPorBuque = new Dictionary<string, List<string>>()
			};

			var exportadorMOA = _repositorio.ObtenerPrimero<Exportador>(e => e.Nombre.Contains("MOLINOS AGRO SA"));
			var tarifasEmbarque = _repositorio.Listar<TarifaPorEmbarque>(t => t.Periodo.Year == periodo.Year && t.Periodo.Month == periodo.Month).ToList();
			var tarifasProducto = _repositorio.Listar<TarifaPorProducto>(t => t.Periodo.Year == periodo.Year && t.Periodo.Month == periodo.Month && t.Cerrado).ToList();

			var lineups = ObtenerLineUpsValidos(periodo, muelleId ?? 0);

			if (embarqueId != null)
			{
				lineups = lineups.Where(l => l.Embarque.Id == embarqueId).ToList();
			}

			var lineupsParaProcesar = lineups.GroupBy(l => l.Embarque.Id).Select(g => g.First()).ToList();

			var tarifasAplicables = new List<TarifaBaseCalculoDto>();
			var buquesMatch = new HashSet<string>();
			var materialesMatch = new HashSet<string>();
			var acuerdosMatch = new HashSet<string>();
			decimal tnTotalMatch = 0;

			foreach (var lineup in lineupsParaProcesar)
			{
				var embarqueDto = _conversor.Convertir<Embarque, EmbarqueDto>(lineup.Embarque);
				var cargasSeguras = lineup.Embarque.OtrosMuelles
									? ObtenerCargasOtrosMuelles(lineup.Embarque)
									: (lineup.Embarque.EsLiquido ? ObtenerCargasLiquido(embarqueDto) : ObtenerCargasSolido(embarqueDto));

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

					if (!infoFiltrada.TnPorBuque.ContainsKey(lineup.Embarque.Patente))
					{
						infoFiltrada.TnPorBuque[lineup.Embarque.Patente] = 0;
					}

					infoFiltrada.TnPorBuque[lineup.Embarque.Patente] += pe.Cantidad;

					DateTime? fechaCarga = null;

					if (lineup.Embarque.OtrosMuelles && lineup.Embarque.OtroMuelleCarga != null && lineup.Embarque.OtroMuelleCarga.OtroMuelleCargaDetalles.Any())
					{
						var maxFechaFin = lineup.Embarque.OtroMuelleCarga.OtroMuelleCargaDetalles.Max(d => d.FechaHoraFin);
						if (maxFechaFin.Year == periodo.Year && maxFechaFin.Month == periodo.Month)
						{
							fechaCarga = maxFechaFin;
						}
					}
					else if (lineup.ModuloDeCarga != null)
					{
						fechaCarga = lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.FirstOrDefault(p => p.FechaDesamarro != null && p.FechaDesamarro.Value.Year == periodo.Year && p.FechaDesamarro.Value.Month == periodo.Month)?.FechaDesamarro;
					}

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
							string patente = lineup.Embarque.Patente;
							string nombreAcuerdo = acuerdoEmbarque.AcuerdoDetalle.Acuerdo.Descripcion;

							acuerdosMatch.Add(nombreAcuerdo);

							if (!infoFiltrada.AcuerdosPorBuque.ContainsKey(patente))
								infoFiltrada.AcuerdosPorBuque[patente] = new List<string>();

							if (!infoFiltrada.AcuerdosPorBuque[patente].Contains(nombreAcuerdo))
								infoFiltrada.AcuerdosPorBuque[patente].Add(nombreAcuerdo);

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
			infoFiltrada.Acuerdos = acuerdosMatch.ToList();
			infoFiltrada.Tn = tnTotalMatch;

			decimal cotizacionGlobal = 1;
			var tarifaDolarGen = _repositorio.Obtener<TarifaCotizacionDolar>(t => t.Periodo.Year == periodo.Year && t.Periodo.Month == periodo.Month);
			if (tarifaDolarGen != null && tarifaDolarGen.ValorDolar > 0) cotizacionGlobal = tarifaDolarGen.ValorDolar;

			return new DatosBaseProvisionInterno { TarifasAplicables = tarifasAplicables, InfoFiltrada = infoFiltrada, CotizacionGlobal = cotizacionGlobal };
		}

		private bool CompararMuelles(Embarque embarque, int muelleId)
		{
			var muellesNuevosIds = new[] { 4, 5, 6 };
			const int idOtrosMuelles = 7;

			var esNuevo = muellesNuevosIds.Contains(muelleId);
			var esOtrosMuelles = muelleId == idOtrosMuelles;

			if (muelleId == 1) return embarque.SanBenito;
			if (muelleId == 2) return embarque.Vicentin;
			if (muelleId == 3) return embarque.Noryon;

			if (!embarque.OtrosMuelles) return false;
			if (esOtrosMuelles) return true;

			if (esNuevo)
			{
				var muelle = _repositorio.Obtener<Muelle>(muelleId);
				return embarque.Muelle != null
					? CompararSinTildes(embarque.Muelle.Descripcion, muelle.Descripcion)
					: CompararSinTildes(embarque.OtroMuelleNombre, muelle.Descripcion);
			}

			return false;
		}

		private bool CompararSinTildes(string a, string b)
		{
			return string.Compare(a, b, CultureInfo.InvariantCulture, CompareOptions.IgnoreNonSpace | CompareOptions.IgnoreCase) == 0;
		}

		private AltaProvisionYGastoDto ObtenerProvisionVisualizarCalculado(List<TarifaBaseCalculoDto> tarifas, decimal cotizacionDolarPeriodo, Dictionary<string, decimal> tnPorBuque, Dictionary<string, List<string>> acuerdosPorBuque)
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
				GranTotalEgresosUSD = 0,
				DesglosesPorBuque = new List<DesglosePorBuqueDto>()
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

			foreach (var patenteBuque in tnPorBuque.Keys)
			{
				var tarifasDelBuque = tarifas.Where(t => t.Embarque.Patente == patenteBuque).ToList();

				var desglose = new DesglosePorBuqueDto
				{
					Buque = patenteBuque,
					Tn = tnPorBuque.ContainsKey(patenteBuque) ? tnPorBuque[patenteBuque] : 0,
					Acuerdos = acuerdosPorBuque.ContainsKey(patenteBuque) ? acuerdosPorBuque[patenteBuque] : new List<string>(),
					ItemsProvision = new List<ItemProvisionDto>()
				};

				foreach (var concepto in allConceptos)
				{
					decimal valorPuroDelConceptoBuque = 0;
					foreach (var t in tarifasDelBuque)
					{
						if (t.AcuerdoEmbarque != null && t.TarifasAcuerdo != null)
						{
							var tarifaConcepto = t.TarifasAcuerdo.FirstOrDefault(c => c.ConceptoId == concepto.Id);
							if (tarifaConcepto != null) valorPuroDelConceptoBuque += tarifaConcepto.ValorTarifa;
						}
						else if (t.TarifaProducto != null && concepto.PorProducto)
						{
							var conceptoTarifaDto = t.TarifaProducto.TarifaPorProductoConcepto.FirstOrDefault(c => c.Concepto.Id == concepto.Id);
							if (conceptoTarifaDto != null) valorPuroDelConceptoBuque += conceptoTarifaDto.Valor;
						}
					}

					if (valorPuroDelConceptoBuque > 0)
					{
						decimal valorRedondeado = Math.Round(valorPuroDelConceptoBuque, 2, MidpointRounding.AwayFromZero);
						desglose.ItemsProvision.Add(new ItemProvisionDto { Concepto = concepto, Valor = valorRedondeado });
						bool esDolar = concepto.Moneda != null && (concepto.Moneda.Descripcion == "Dolares" || concepto.Moneda.Id == 2);
						bool esIngreso = concepto.TipoConcepto != null && (concepto.TipoConcepto.Descripcion == "Ingreso" || concepto.TipoConcepto.Id == 1);

						if (esIngreso)
						{
							if (esDolar) desglose.IngresosUSD += valorRedondeado;
							else desglose.IngresosARS += valorRedondeado;
						}
						else
						{
							if (esDolar) desglose.EgresosUSD += valorRedondeado;
							else desglose.EgresosARS += valorRedondeado;
						}
					}
				}
				totalizador.DesglosesPorBuque.Add(desglose);
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