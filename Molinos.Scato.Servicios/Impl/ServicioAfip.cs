using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Dto.AfipTablasReferencia;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using static NPOI.HSSF.Util.HSSFColor;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioAfip : IServicioAfip
    {
        private readonly IRepositorio _repositorio;
        private readonly IConversor _conversor;
        private readonly ILogger _log;
        private readonly IServicioComandos _servicioComandos;
        private readonly IServicioRepositorio _servicioRepositorio;

        public ServicioAfip(
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

        private void LogInicio(object request = null, [CallerMemberName] string metodo = "")
        {
            _log.Info("Inicializando " + metodo);
            if (request != null)
            {
                _log.Info(" request: " + JsonConverter<object>.Serialize(request));
            }
        }

        private void LogInicio(int id, [CallerMemberName] string metodo = "")
        {
            _log.Info("Inicializando " + metodo);
            _log.Info(" id: " + id.ToString());
        }

        private void LogFin(object response = null, [CallerMemberName] string metodo = "")
        {
            if (response != null)
            {
                _log.Info(" response: " + JsonConverter<object>.Serialize(response));
            }
            _log.Info("Finalizando " + metodo);
        }

        private void GuardarLog(object request, object response, [CallerMemberName] string metodo = "")
        {
            var req = JsonConverter<object>.Serialize(request);
            var res = JsonConverter<object>.Serialize(response);
            _servicioRepositorio.GuardarLogAfipCpe(metodo, req, res);
        }

        private void GuardarLog(int id, object response, [CallerMemberName] string metodo = "")
        {
            var res = JsonConverter<object>.Serialize(response);
            _servicioRepositorio.GuardarLogAfipCpe(metodo, id.ToString(), res);
        }

        #endregion

        #region Tablas de referencia

        public IList<AfipTipoEmbalajeDto> ListarTiposEmbalaje()
        {
            return Listar<AfipTipoEmbalaje, AfipTipoEmbalajeDto>();
        }

        public IList<AfipPuntoAduaneroDto> ListarPuntosAduaneros()
        {
            return Listar<AfipPuntoAduanero, AfipPuntoAduaneroDto>();
        }

        public IList<AfipPuertoDto> ListarPuertos()
        {
            return Listar<AfipPuerto, AfipPuertoDto>();
        }

        public IList<AfipPaisDto> ListarPaises()
        {
            return Listar<AfipPais, AfipPaisDto>();
        }

        public IList<AfipTipoDocumentoDto> ListarTiposDocumento()
        {
            return Listar<AfipTipoDocumento, AfipTipoDocumentoDto>();
        }

        public IList<AfipNaturalezaEmbalajeDto> ListarNaturalezasEmbalaje()
        {
            return Listar<AfipNaturalezaEmbalaje, AfipNaturalezaEmbalajeDto>();
        }

        public IList<AfipLugarOperativoDto> ListarLugaresOperativos()
        {
            return Listar<AfipLugarOperativo, AfipLugarOperativoDto>();
        }

        public IList<AfipCondicionContenedorDto> ListarCondicionesContenedor()
        {
            return Listar<AfipCondicionContenedor, AfipCondicionContenedorDto>();
        }

        public IList<AfipMotivoSolicitudCambioDto> ListarMotivosSolicitudCambio()
        {
            return Listar<AfipMotivoSolicitudCambio, AfipMotivoSolicitudCambioDto>();
        }

        #endregion

        #region Caratulas

        public ListaPaginada<AfipCaratulaDto> ListarCaratulas(Paginacion paginacion, DateTime? fechaArribo = null, string buque = null, string identificador = null, string estado = null)
        {
            var request = new ListarAfipCaratulaConsulta(paginacion, fechaArribo, buque, identificador, estado);
            LogInicio(request);

            var response = _repositorio.ListarConsultaPaginada(request);
            LogFin(response);

            GuardarLog(request, response);

            return _conversor.ConvertirListaPaginada<AfipCaratula, AfipCaratulaDto>(response);
        }

        public AfipCaratulaDto ObtenerCaratula(int id)
        {
            LogInicio(id);

            var response = Obtener<AfipCaratula, AfipCaratulaDto>(id);
            if (response.SolicitudesCambioBuque?.Count > 0)
            {
                response.SolicitudesCambioBuque = response.SolicitudesCambioBuque.OrderByDescending(s => s.FechaCreacion).ToList();
            }
            if (response.SolicitudesCambioFechas?.Count > 0)
            {
                response.SolicitudesCambioFechas = response.SolicitudesCambioFechas.OrderByDescending(s => s.FechaCreacion).ToList();
            }

            LogFin(response);

            return response;
        }

        public bool RegistrarCaratula(AfipRegistrarCaratulaDto request, string usuario)
        {
            LogInicio(request);

            var response = _servicioComandos.Ejecutar(new AfipRegistrarCaratula { Dto = request, Usuario = usuario });

            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }

            GuardarLog(request, response);
            LogFin(response);

            return !response.HayErrores;
        }

        public bool RectificarCaratula(AfipRectificarCaratulaDto request, string usuario)
        {
            LogInicio(request);

            var response = _servicioComandos.Ejecutar(new AfipRectificarCaratula { Dto = request, Usuario = usuario });

            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }

            GuardarLog(request, response);
            LogFin(response);

            return !response.HayErrores;
        }

        public bool AnularCaratula(int id, string usuario)
        {
            LogInicio(id);

            var response = _servicioComandos.Ejecutar(new AfipAnularCaratula { Id = id, Usuario = usuario });

            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }

            GuardarLog(id, response);
            LogFin(response);

            return !response.HayErrores;
        }

        public IList<string> ListarEstadosCaratula()
        {
            LogInicio();
            Type estadosType = typeof(EstadosCaratulaAFIP);
            var response = estadosType.GetFields().Select(f => (string)f.GetValue(null)).ToList();
            LogFin();
            return response;
        }

        public bool CambiarEstadoCaratula(int id, string estado, string usuario)
        {
            try
            {
                var request = new { Id = id, Estado = estado };
                LogInicio(request);

                var caratula = _repositorio.Obtener<AfipCaratula>(id) ?? throw new Exception("No existe la carátula con el id indicado");

                var estados = ListarEstadosCaratula();
                if (!estados.Contains(estado))
                {
                    throw new Exception("El estado indicado no es válido");
                }

                caratula.Estado = estado;

                var logABM = new LogABM
                {
                    Pantalla = "CambiarEstadoCaratula",
                    Usuario = usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = $"Caratula {caratula.IdentificadorCaratula}: {caratula.Estado} -> {estado}",
                    ClaseId = id
                };
                _repositorio.Agregar(logABM);

                _repositorio.GuardarCambios();

                var response = new { Ok = true };
                LogFin(response);
                GuardarLog(request, response);

                return true;
            }
            catch (Exception e)
            {
                _log.Error($"Error al cambiar estado caratula {e.Message}, {e.InnerException?.Message}");
                return false;
            }
        }

        public IList<AfipCaratulaDto> ComboCaratulas()
        {
            var caratulas = _repositorio.Listar(x => new { x.Id, x.IdentificadorCaratula }, (AfipCaratula x) => true);
            var res = caratulas.Select(x => new AfipCaratulaDto { Id = x.Id, IdentificadorCaratula = x.IdentificadorCaratula }).ToList();
            return res;
        }

        public void CaratulaCambiarTipoProducto(int id, string usuario)
        {
            LogInicio(id);

            var caratula = _repositorio.Obtener<AfipCaratula>(id) ?? throw new Exception("No existe la carátula con el id indicado");
            caratula.EsLiquido = !caratula.EsLiquido;

            var logABM = new LogABM
            {
                Pantalla = "CaratulaCambiarTipoProducto",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = $"Caratula {caratula.IdentificadorCaratula}: EsLiquido {caratula.EsLiquido} -> {!caratula.EsLiquido}",
                ClaseId = id
            };
            _repositorio.Agregar(logABM);
            _repositorio.GuardarCambios();

            var response = new { Ok = true };
            GuardarLog(id, response);
            LogFin(response);
        }
        #endregion

        #region COEMs
        public ListaPaginada<AfipCoemDto> ListarCoems(int? idCaratula, Paginacion paginacion, string identificador, string declaracion, string estado)
        {
            var request = new ListarAfipCoemConsulta(paginacion, idCaratula, identificador, declaracion, estado);

            LogInicio(request);

            var response = _repositorio.ListarConsultaPaginada(request);

            GuardarLog(request, response);
            LogFin(response);

            return _conversor.ConvertirListaPaginada<AfipCoem, AfipCoemDto>(response);
        }

        public AfipCoemDto ObtenerCoem(int id)
        {
            LogInicio(id);

            var response = Obtener<AfipCoem, AfipCoemDto>(id);

            GuardarLog(id, response);
            LogFin(response);

            return response;
        }

        public bool RegistrarCoem(AfipCoemRegistrarRequest coem, string usuario)
        {
            var request = _conversor.Convertir<AfipCoemRegistrarRequest, AfipCoemDto>(coem);

            LogInicio(request);

            var response = _servicioComandos.Ejecutar(new AfipRegistrarCoem { Dto = request, Usuario = usuario });
            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }

            GuardarLog(request, response);
            LogFin(response);

            return !response.HayErrores;
        }

        public bool RectificarCoem(AfipCoemDto coem, string usuario)
        {
            var request = new AfipRectificarCoem { Dto = coem, Usuario = usuario };

            LogInicio(request);

            var response = _servicioComandos.Ejecutar(request);
            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }

            GuardarLog(request, response);
            LogFin(response);

            return !response.HayErrores;
        }

        public bool AnularCoem(int id, int idEstado, string usuario)
        {
            var request = new AfipAnularCoem { Id = id, IdEstado = idEstado, Usuario = usuario };

            LogInicio(request);

            var response = _servicioComandos.Ejecutar(request);
            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }

            GuardarLog(request, response);
            LogFin(response);

            return !response.HayErrores;
        }

        public bool CerrarCoem(int id, int idEstado, string usuario)
        {
            var request = new AfipCerrarCoem { Id = id, IdEstado = idEstado, Usuario = usuario };

            LogInicio(request);

            var response = _servicioComandos.Ejecutar(request);
            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }

            GuardarLog(request, response);
            LogFin(response);

            return !response.HayErrores;
        }

        public bool SolicitarAnulacionCoem(int id, string usuario)
        {
            var request = new AfipSolicitarAnulacionCoem { Id = id, Usuario = usuario };

            LogInicio(request);

            var response = _servicioComandos.Ejecutar(request);
            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }

            GuardarLog(request, response);
            LogFin(response);

            return !response.HayErrores;
        }

        public IList<AfipCoemEstadoDto> ListarEstadosCoem()
        {
            var estados = Listar<AfipCoemEstado, AfipCoemEstadoDto>();
            return estados.OrderBy(x => x.Orden).ToList();
        }

        public void CambiarEstadoCoem(int idCoem, int idEstado, string usuario)
        {
            var request = new { idCoem, idEstado };
            LogInicio(request);
            try
            {
                if (ValidarEstados(idCoem, idEstado))
                {
                    var coem = this._repositorio.Obtener<AfipCoem>(idCoem) ?? throw new Exception("No existe la COEM con el id indicado");
                    var estado = this._repositorio.Obtener<AfipCoemEstado>(idEstado) ?? throw new Exception("No existe el estado con el ID indicado");

                    var logABM = new LogABM
                    {
                        Pantalla = "CambiarEstadoCoem",
                        Usuario = usuario,
                        Fecha = DateTime.Now,
                        Evento = EventoABM.Modificacion,
                        Entidad = $"COEM {coem.IdentificadorCOEM}: {coem.AfipCoemEstado.Estado} -> {estado.Estado}",
                        ClaseId = idCoem
                    };
                    _repositorio.Agregar(logABM);

                    coem.AfipCoemEstado = estado;
                    this._repositorio.GuardarCambios();

                    var response = new { Ok = true };
                    GuardarLog(request, response);
                    LogFin(response);
                }
            }
            catch (Exception ex)
            {
                this._log.Error("Error al cambiar estado de la COEM {0}", ex.StackTrace);
                throw new Exception("Error al cambiar estado de la COEM");
            }

        }

        private bool ValidarEstados(int idCoem, int idEstado)
        {
            var retorno = true;
            var estadoActual = this._repositorio.Obtener<AfipCoem>(idCoem).AfipCoemEstado;
            var estadoSeleccionado = this._repositorio.Obtener<AfipCoemEstado>(idEstado);

            if (estadoActual.Codigo != "CUR" && estadoSeleccionado.Codigo == "CUR")
            {
                var texto = "La COEM no puede volver a estar en el estado EN CURSO";
                throw new Exception(texto);
            }
            else if (estadoSeleccionado.Codigo == "ANU" && estadoActual.Codigo != "CUR" && estadoActual.Codigo != "REG" && estadoActual.Codigo != "PRE")
            {
                var texto = "Para poder cambiar la COEM al estado ANULADA (ANU), debe estar en alguno de los estados <b>EN CURSO (CUR)</b>, <b>REGISTRADA (REG)</b>, ó <b>PRESENTADA (PRE)</b>";
                throw new Exception(texto);
            }
            else if (estadoSeleccionado.Codigo == "REG" && estadoActual.Codigo != "CUR")
            {
                var texto = "Para poder cambiar la COEM al estado REGISTRADA (REG), debe estar en estado EN CURSO (CUR)";
                throw new Exception(texto);
            }
            else if (estadoSeleccionado.Codigo == "PRE" && estadoActual.Codigo != "REG")
            {
                var texto = "Para poder pasar la COEM al estado PRESENTADA (PRE), debe estar en estado REGISTRADA (REG)";
                throw new Exception(texto);
            }
            else if (estadoSeleccionado.Codigo == "REC" && estadoActual.Codigo != "PRE")
            {
                var texto = "Para poder pasar la COEM al estado RECHAZADA (REC), debe estar en estado PRESENTADA (PRE)";
                throw new Exception(texto);
            }
            else if (estadoSeleccionado.Codigo == "AUT" && estadoActual.Codigo != "PRE")
            {
                var texto = "Para poder pasar la COEM al estado AUTORIZADA (AUT), debe estar en estado PRESENTADA (PRE)";
                throw new Exception(texto);
            }
            else if (estadoSeleccionado.Codigo == "CAN" && estadoActual.Codigo != "AUTO")
            { // y la coem ha sido convertida en una CODE
                var texto = "Para poder pasar la COEM al estado CANCELADA (CAN), debe estar en estado AUTORIZADA (PRE)";
                throw new Exception(texto);
            }

            return retorno;
        }
        #endregion

        #region CODE
        public IList<AfipCodeDto> ListarCode()
        {
            _log.Info("Inicializando ListarCode");
            var response = Listar<AfipCode, AfipCodeDto>();
            var res = JsonConverter<IList<AfipCodeDto>>.Serialize(response);
            _log.Info($" response: {res}");
            _servicioRepositorio.GuardarLogAfipCpe("ListarCode", "", res);
            _log.Info("Finalizando ListarCode");
            return response;
        }

        public AfipCodeDto ObtenerCode(int id)
        {
            _log.Info("Inicializando ObtenerCode");
            _log.Info($" id: {id}");
            var response = Obtener<AfipCode, AfipCodeDto>(id);
            var res = JsonConverter<AfipCodeDto>.Serialize(response);
            _log.Info($" response: {res}");
            _servicioRepositorio.GuardarLogAfipCpe("ObtenerCode", id.ToString(), res);
            _log.Info("Finalizando ObtenerCode");
            return response;
        }

        public void RegistrarCode(AfipCodeDto code)
        {
            _log.Info("Inicializando RegistrarCode");
            var request = new AfipRegistrarCode { Dto = code };
            var req = JsonConverter<AfipRegistrarCode>.Serialize(request);
            _log.Info($" request: {req}");
            _servicioComandos.Ejecutar(request);
            _servicioRepositorio.GuardarLogAfipCpe("RegistrarCode", req, "");
            _log.Info("Finalizando RegistrarCode");
        }
        #endregion

        #region Solicitudes

        #region Solicitar Cierre de Carga
        public bool SolicitarCierreCargaGranel(AfipSolicitarCierreCargaGranelDto solicitarCierreCargaGranelDto, string usuario)
        {
            var request = new AfipSolicitarCierreCargaGranel { Dto = solicitarCierreCargaGranelDto, Usuario = usuario };

            LogInicio(request);

            var response = _servicioComandos.Ejecutar(request);
            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }

            GuardarLog(request, response);
            LogFin(response);

            return !response.HayErrores;
        }

        public IList<AfipSolicitudCierreCargaDto> ListarSolicitudesCierreCarga(int id = 0)
        {
            LogInicio(id);

            var response = Listar<AfipSolicitudCierreCarga, AfipSolicitudCierreCargaDto>(x => id == 0 || x.AfipCaratula.Id == id);

            GuardarLog(id, response);
            LogFin(response);

            return response.OrderByDescending(x => x.FechaCreacion).ToList();
        }

        public void EfectuarSolicitudCierreCarga(int id, string usuario)
        {
            LogInicio(id);

            var solicitudDb = _repositorio.Obtener<AfipSolicitudCierreCarga>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (solicitudDb.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            var estadoCoem = _repositorio.Obtener<AfipCoemEstado>(x => x.Codigo == "CODE") ?? throw new Exception("No existe el estado 'CODE' en la base de datos");
            var caratula = solicitudDb.AfipCaratula;
            foreach (var coem in caratula?.Coems)
            {
                coem.AfipCoemEstado = estadoCoem;
            }
            caratula.Estado = EstadosCaratulaAFIP.Code;
            solicitudDb.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
            solicitudDb.FechaActualizacion = DateTime.Now;


            var logABM = new LogABM
            {
                Pantalla = "EfectuarSolicitudCierreCarga",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = JsonConverter<AfipSolicitudCierreCarga>.Serialize(solicitudDb),
                ClaseId = caratula.Id
            };
            _repositorio.Agregar(logABM);

            _repositorio.GuardarCambios();

            GuardarLog(id, solicitudDb);
            LogFin(solicitudDb);
        }

        public void RechazarSolicitudCierreCarga(int id, string usuario)
        {
            LogInicio(id);

            var solicitud = _repositorio.Obtener<AfipSolicitudCierreCarga>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (solicitud.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            solicitud.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
            solicitud.FechaActualizacion = DateTime.Now;


            var logABM = new LogABM
            {
                Pantalla = "RechazarSolicitudCierreCarga",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = JsonConverter<AfipSolicitudCierreCarga>.Serialize(solicitud);
                ClaseId = solicitud.AfipCaratula.Id
            };
            _repositorio.Agregar(logABM);

            _repositorio.GuardarCambios();

            GuardarLog(id, solicitud);
            LogFin(solicitud);
        }
        #endregion

        #region Solicitar No a bordo
        public bool SolicitarNoAbordo(AfipSolicitarNoAbordoDto solicitarNoAbordoDto, string usuario)
        {
            var request = new AfipSolicitarNoAbordo { Dto = solicitarNoAbordoDto, Usuario = usuario };

            LogInicio(request);

            var response = _servicioComandos.Ejecutar(request);
            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }

            GuardarLog(request, response);
            LogFin(response);

            return !response.HayErrores;
        }

        public IList<AfipMotivoNoAbordoDto> ListarMotivosNoAbordo()
        {
            var response = Listar<AfipMotivoNoABordo, AfipMotivoNoAbordoDto>();
            return response;
        }

        public void EfectuarSolicitudNoABordo(int id, string usuario)
        {
            LogInicio(id);

            var response = _repositorio.Obtener<AfipSolicitudNoABordo>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            var declaraciones = response.AfipSolicitudNoABordoDeclaraciones.Select(x => x.AfipCoemMercaderiaSuelta).ToList();
            foreach (var declaracion in declaraciones)
            {
                declaracion.NoABordo = true;
            }
            response.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
            response.FechaActualizacion = DateTime.Now;

            var logABM = new LogABM
            {
                Pantalla = "EfectuarSolicitudNoABordo",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = JsonConverter<AfipSolicitudNoABordo>.Serialize(response);
                ClaseId = response.AfipCoem.Id,
            };

            _repositorio.GuardarCambios();

            GuardarLog(id, response);
            LogFin(response);
        }

        public void RechazarSolicitudNoABordo(int id, string usuario)
        {
            LogInicio(id);

            var response = _repositorio.Obtener<AfipSolicitudNoABordo>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            response.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
            response.FechaActualizacion = DateTime.Now;


            var logABM = new LogABM
            {
                Pantalla = "RechazarSolicitudNoABordo",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = JsonConverter<AfipSolicitudNoABordo>.Serialize(response);
                ClaseId = response.AfipCoem.Id,
            };
            _repositorio.Agregar(logABM);

            _repositorio.GuardarCambios();

            GuardarLog(id, response);
            LogFin(response);
        }
        #endregion

        #region Solicitar Cambio de Buque
        public void SolicitarCambioBuque(AfipSolicitarCambioBuqueDto solicitarCambioBuqueDto, string usuario)
        {
            var request = new AfipSolicitarCambioBuque { Dto = solicitarCambioBuqueDto, Usuario = usuario }

                LogInicio(request);

            var response = this._servicioComandos.Ejecutar(request);
            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }

            GuardarLog(request, response);
            LogFin(response);
        }

        public IList<AfipSolicitudCambioBuqueDto> ListarSolicitudesCambioBuque(int id = 0)
        {
            IList<AfipSolicitudCambioBuqueDto> resultado;
            if (id != 0)
            {
                resultado = Listar<AfipSolicitudCambioBuque, AfipSolicitudCambioBuqueDto>(x => x.AfipCaratula.Id == id);
            }
            else
            {
                resultado = Listar<AfipSolicitudCambioBuque, AfipSolicitudCambioBuqueDto>();
            }
            return resultado.OrderByDescending(x => x.FechaCreacion).ToList();
        }

        public void EfectuarSolicitudCambioBuque(int id, string usuario)
        {
            LogInicio(id);

            var response = _repositorio.Obtener<AfipSolicitudCambioBuque>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            var caratula = response.AfipCaratula;
            caratula.IdentificadorBuque = response.IdentificadorBuque;
            caratula.NombreMedioTransporte = response.NombreMedioTransporte;
            response.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
            response.FechaActualizacion = DateTime.Now;

            var logABM = new LogABM
            {
                Pantalla = "EfectuarSolicitudCambioBuque",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = JsonConverter<AfipSolicitudCambioBuque>.Serialize(response);
                ClaseId = caratula.Id
            };
            _repositorio.Agregar(logABM);

            _repositorio.GuardarCambios();

            GuardarLog(id, response);
            LogFin(response);
        }

        public void RechazarSolicitudCambioBuque(int id, string usuario)
        {
            LogInicio(id);

            var response = _repositorio.Obtener<AfipSolicitudCambioBuque>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            response.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
            response.FechaActualizacion = DateTime.Now;

            var logABM = new LogABM
            {
                Pantalla = "RechazarSolicitudCambioBuque",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = JsonConverter<AfipSolicitudCambioBuque>.Serialize(response);
                ClaseId = response.AfipCaratula.Id
            };
            _repositorio.Agregar(logABM);

            _repositorio.GuardarCambios();

            GuardarLog(id, response);
            LogFin(response);
        }
        #endregion

        #region Solicitar Cambio de Fechas
        public void SolicitarCambioFechas(AfipSolicitarCambioFechasDto solicitarCambioFechasDto, string usuario)
        {
            var request = new AfipSolicitarCambioFechas { Dto = solicitarCambioFechasDto, Usuario = usuario };

            LogInicio(request);

            var response = _servicioComandos.Ejecutar(request);
            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }

            GuardarLog(request, response);
            LogFin(response);
        }

        public IList<AfipSolicitudCambioFechasDto> ListarSolicitudesCambioFechas(int id = 0)
        {
            IList<AfipSolicitudCambioFechasDto> resultado;
            if (id != 0)
            {
                resultado = Listar<AfipSolicitudCambioFechas, AfipSolicitudCambioFechasDto>(x => x.AfipCaratula.Id == id);
            }
            else
            {
                resultado = Listar<AfipSolicitudCambioFechas, AfipSolicitudCambioFechasDto>();
            }
            return resultado.OrderByDescending(x => x.FechaCreacion).ToList();
        }

        public void EfectuarSolicitudCambioFechas(int id, string usuario)
        {
            LogInicio(id);

            var response = _repositorio.Obtener<AfipSolicitudCambioFechas>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            var caratula = response.AfipCaratula;
            caratula.FechaArribo = response.FechaArribo;
            caratula.FechaZarpada = response.FechaZarpada;
            response.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
            response.FechaActualizacion = DateTime.Now;

            var logABM = new LogABM
            {
                Pantalla = "EfectuarSolicitudCambioFechas",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = JsonConverter<AfipSolicitudCambioFechas>.Serialize(response);
                ClaseId = caratula.Id
            };
            _repositorio.Agregar(logABM);

            _repositorio.GuardarCambios();

            GuardarLog(id, response);
            LogFin(response);
        }

        public void RechazarSolicitudCambioFechas(int id, string usuario)
        {
            LogInicio(id);

            var response = _repositorio.Obtener<AfipSolicitudCambioFechas>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            response.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
            response.FechaActualizacion = DateTime.Now;

            var logABM = new LogABM
            {
                Pantalla = "RechazarSolicitudCambioFechas",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = JsonConverter<AfipSolicitudCambioFechas>.Serialize(response);
                ClaseId = response.AfipCaratula.Id
            };

            _repositorio.GuardarCambios();

            GuardarLog(id, response);
            LogFin(response);
        }
        #endregion

        #endregion
    }
}
