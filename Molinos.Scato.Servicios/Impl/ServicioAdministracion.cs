using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Dto.Documentos;
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
            var exportadoresNominacion = ObtenerExportadoresNominacion(nominaciones);
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
            var infoBuque = ObtenerInformacionBuque(cargas);

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
            var nominaciones = _repositorio.Listar<Nominacion>(n => n.Embarque.Id == embarqueId).ToList();
            if (!nominaciones.Any())
            {
                nominaciones = _repositorio.Listar<NominacionEmbarque>(x => x.Embarque.Id == embarqueId)
                                           .Select(x => x.Nominacion).ToList();
            }
            return nominaciones;
        }

        private List<ExportadorDto> ObtenerExportadoresNominacion(List<Nominacion> nominaciones)
        {
            return _conversor.ConvertirList<Exportador, ExportadorDto>(
                nominaciones.SelectMany(x => x.NominacionDatoTecnico.NominacionDatoTecnicoExportador)
                            .Select(e => e.Exportador)
                            .ToList()).ToList();
        }

        private List<AgenciaMaritimaPuertoDto> ObtenerAgenciasNominacion(List<Nominacion> nominaciones)
        {
            return _conversor.ConvertirList<AgenciaMaritimaPuerto, AgenciaMaritimaPuertoDto>(
                nominaciones.Select(x => x.NominacionDatoTecnico.AgenciaMaritimaPuerto).ToList()).ToList();
        }

        private List<CoordinadorPuertoDto> ObtenerClientesNominacion(List<Nominacion> nominaciones)
        {
            return _conversor.ConvertirList<CoordinadorPuerto, CoordinadorPuertoDto>(
                nominaciones.SelectMany(x => x.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto)
                .Select(x => x.CoordinadorPuerto).ToList()).ToList();
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
            return surveyors != null && surveyors.Any() ? string.Join(", ", surveyors): "N/A";
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
                Senasa = nominaciones.Any(x => x.NominacionDetalleIntervencion?.Senasa?.Any() == true),
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
                Senasa = nominaciones.Any(x => x.NominacionDetalleIntervencion?.Senasa?.Any() == true),
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

    }
}