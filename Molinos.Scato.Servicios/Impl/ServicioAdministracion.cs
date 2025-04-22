using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Entidades;
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
            /*  List<string> listaBuques = string.IsNullOrEmpty(filtros?.Buques) ? new List<string>() : filtros.Buques.Split(',').ToList();
              List<string> listaMuelles = string.IsNullOrEmpty(filtros.Muelles) ? new List<string>() : filtros.Muelles.Split(',').ToList();
              List<string> listaExportadores = string.IsNullOrEmpty(filtros.Exportadores) ? new List<string>() : filtros.Exportadores.Split(',').ToList();
              List<string> listaClientes = string.IsNullOrEmpty(filtros.Clientes) ? new List<string>() : filtros.Clientes.Split(',').ToList();
              List<string> listaMateriales = string.IsNullOrEmpty(filtros.Materiales) ? new List<string>() : filtros.Materiales.Split(',').ToList();
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

              return new ListarEmbarquesAdministracionConsulta(paginacion, filtros.Desamarre, listaBuques, listaMuelles, filtros.Tanques, listaExportadores, listaClientes, listaMateriales, listaEstados);
          */
            return new ListarEmbarquesAdministracionConsulta(paginacion, filtros.Desamarre, new List<string>(), new List<string>(), filtros.Tanques, new List<string>(), new List<string>(), new List<string>(), new List<string>());

        }

        public DetalleEmbarqueAFacturarDto ObtenerDetalleEmbarque(int embarqueId)
        {
            var lineup = _repositorio.Obtener<LineUp>(l => l.Embarque.Id == embarqueId);
            var estado = lineup.Embarque.Ubicacion == 1 ? "A facturar" :
             !lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos.Any() ? "LineUp" :
             lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos.All(x => x.Cerrado) ? "Calidad" : "Operaciones";

            var estadoBd = _repositorio.Obtener<EstadoEmbarque>(e => e.Descripcion.ToLower() == estado.ToLower());
            var nominaciones = _repositorio.Listar<Nominacion>(n => n.Embarque.Id == embarqueId).ToList();
            if (nominaciones == null || !nominaciones.Any())
            {
                nominaciones = _repositorio.Listar<NominacionEmbarque>(x => x.Embarque.Id == embarqueId)?.Select(x => x.Nominacion).ToList();
            }

            var exportadoresNominacion = _conversor.ConvertirList<Exportador, ExportadorDto>(
                (nominaciones)
                .SelectMany(x => x.NominacionDatoTecnico.NominacionDatoTecnicoExportador)
                .Select(e => e.Exportador)
                .ToList());

            var agenciasNominacion = _conversor.ConvertirList<AgenciaMaritimaPuerto, AgenciaMaritimaPuertoDto>(
                (nominaciones)
                .Select(x => x.NominacionDatoTecnico.AgenciaMaritimaPuerto)
                .ToList());

            var amarreNominacion = nominaciones.Any() ? nominaciones.First().NominacionDatoTecnico.ETARecalada : (DateTime?)null;
            var administracionEmbarque = _conversor.Convertir<AdministracionEmbarque, AdministracionEmbarqueDto>(lineup.Embarque.AdministracionEmbarque);
            var muelle = lineup.Embarque.SanBenito ? "San Benito" : lineup.Embarque.Vicentin ? "Vicentin" : lineup.Embarque.Noryon ? "Nouryon" : lineup.Embarque.OtrosMuelles ? lineup.Embarque.OtroMuelleNombre : "Otros Muelles";

            var cargas = lineup.Embarque.EsLiquido
                ? (IEnumerable<object>)lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido)
                : lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesSolido);

            var infoBuque = ObtenerInformacionBuque(cargas);

            if (estadoBd.Descripcion == "Lineup")
            {
                return new DetalleEmbarqueAFacturarDto
                {
                    IdEmbarque = embarqueId,
                    EsLiq = lineup.Embarque.EsLiquido,
                    Estado = administracionEmbarque == null ? estado : administracionEmbarque.Estado.Descripcion,
                    Buque = lineup.Embarque.Patente,
                    Muelle = muelle,
                    Amarre = amarreNominacion,
                    HoraAmarre = null,
                    Desamarre = null,
                    HoraDesamarre = null,
                    NroOp = 0, //TODO ingreso de nro Op
                    Senasa = nominaciones != null && nominaciones.Any(x => x.NominacionDetalleIntervencion != null && x.NominacionDetalleIntervencion.Senasa != null && x.NominacionDetalleIntervencion.Senasa.Any()) ? true : false,
                    DefMoviles = false,
                    FumigacionPrev = false,
                    FumigacionCur = false,
                    UsoPala = false,
                    Exportadores = exportadoresNominacion,
                    Agencias = agenciasNominacion,
                    AdministracionEmbarque = administracionEmbarque,
                    Cargas = infoBuque
                };
            }
            else
            {
                var exportadoresCargas = lineup.Embarque.EsLiquido
                    ? lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos
                        .SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido)
                        .Select(x => x.Exportador)
                        .Distinct()
                        .ToList()
                    : lineup.ModuloDeCarga.ModuloDeCargaPlanillaDeTurnos
                        .SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesSolido)
                        .Select(x => x.Exportador)
                        .Distinct()
                        .ToList();

                var exportadoresModCarga = _conversor.ConvertirList<Exportador, ExportadorDto>(exportadoresCargas);

                var periodoDeCarga = lineup.ModuloDeCarga.ModuloDeCargaPeriodoDeCarga.FirstOrDefault();
                var amarre = periodoDeCarga?.FechaAmarro ?? amarreNominacion;
                var desamarre = periodoDeCarga?.FechaDesamarro;
                var horaAmarre = periodoDeCarga?.HoraAmarro ?? (amarreNominacion.HasValue ? amarreNominacion.Value.ToString("HH:mm") : null);
                var horaDesamarre = periodoDeCarga?.HoraDesamarro ?? "";
                var usoPala = lineup.ModuloDeCarga?.ModuloDeCargaPlanillaDeTurnos?.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad).Any() ?? false;
                return new DetalleEmbarqueAFacturarDto
                {
                    IdEmbarque = embarqueId,
                    EsLiq = lineup.Embarque.EsLiquido,
                    Estado = administracionEmbarque == null ? estado : administracionEmbarque.Estado.Descripcion,
                    Buque = lineup.Embarque.Patente,
                    Muelle = muelle,
                    Amarre = amarre,
                    HoraAmarre = horaAmarre,
                    HoraDesamarre = horaDesamarre,
                    Desamarre = desamarre,
                    NroOp = 0, //TODO ingreso de nro Op
                    Senasa = nominaciones != null && nominaciones.Any(x => x.NominacionDetalleIntervencion != null && x.NominacionDetalleIntervencion.Senasa != null && x.NominacionDetalleIntervencion.Senasa.Any()) ? true : false,
                    DefMoviles = lineup?.PlanoDeCarga != null ? lineup.PlanoDeCarga.DefensasMoviles : false,
                    FumigacionPrev = false,
                    FumigacionCur = false,
                    UsoPala = lineup.Embarque.EsLiquido ? false : usoPala,
                    Exportadores = exportadoresModCarga.Any() ? exportadoresModCarga.ToList() : exportadoresNominacion.ToList(),
                    Agencias = agenciasNominacion.ToList(),
                    AdministracionEmbarque = administracionEmbarque,
                    Cargas = infoBuque
                };
            }
        }

        private List<InformacionBuqueDto> ObtenerInformacionBuque(IEnumerable<object> cargas)
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
                    var infoBuque = new InformacionBuqueDto
                    {
                        Exportador = item.Exportador.Nombre,
                        MaterialPuerto = item.MaterialPuerto.Descripcion,
                        NroTanque = item.Tk,
                        TanqueOrigen = item.TipoLineaEmbarque.Linea,
                        Tn = item.TotalCantidad
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
                        TotalCantidad = g.Sum(c => c.Cantidad)
                    });

                foreach (var item in agrupadoSolido)
                {
                    var infoBuque = new InformacionBuqueDto
                    {
                        Exportador = item.Exportador.Nombre,
                        MaterialPuerto = item.MaterialPuerto.Descripcion,
                        Bodega = int.Parse(item.Bodega.Nombre.Last().ToString()),
                        SiloCelda = esIngresoManual ? item.SiloCelda?.Nombre : null,
                        Tn = item.TotalCantidad
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
    }
}