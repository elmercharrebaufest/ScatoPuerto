using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Dto.AfipTablasReferencia;
using Molinos.Scato.Dominio.Entidades;
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
			_log.Info("Inicializando ListarCaratulas");
            var request = new ListarAfipCaratulaConsulta(paginacion, fechaArribo, buque, identificador, estado);
			var req = JsonConverter<ListarAfipCaratulaConsulta>.Serialize(request);
			_log.Info($" request: { req }");
			var response = _repositorio.ListarConsultaPaginada(request);
			var res = JsonConverter<ListaPaginada<AfipCaratula>>.Serialize(response);
			_log.Info($" response: { res }");
			_servicioRepositorio.GuardarLogAfipCpe("ListarCaratulas", req, res);
			_log.Info("Finalizando ListarCaratulas");
			return _conversor.ConvertirListaPaginada<AfipCaratula, AfipCaratulaDto>(response);
        }

        public AfipCaratulaDto ObtenerCaratula(int id)
        {
			_log.Info("Inicializando ObtenerCaratula");
			_log.Info($" id: { id }");
			var response = Obtener<AfipCaratula, AfipCaratulaDto>(id);
            if (response.SolicitudesCambioBuque?.Count > 0)
            {
				response.SolicitudesCambioBuque = response.SolicitudesCambioBuque.OrderByDescending(s => s.FechaCreacion).ToList();
            }
            if (response.SolicitudesCambioFechas?.Count > 0)
            {
				response.SolicitudesCambioFechas = response.SolicitudesCambioFechas.OrderByDescending(s => s.FechaCreacion).ToList();
            }
			_log.Info($" response: { JsonConverter<AfipCaratulaDto>.Serialize(response) }");
			_log.Info("Finalizando ObtenerCaratula");
			return response;
        }

        public bool RegistrarCaratula(AfipRegistrarCaratulaDto request)
        {
			_log.Info("Inicializando RegistrarCaratula");
			var req = JsonConverter<AfipRegistrarCaratulaDto>.Serialize(request);
			_log.Info($" request: { req }");
			var response = _servicioComandos.Ejecutar(new AfipRegistrarCaratula { Dto = request });
			var res = JsonConverter<Resultado>.Serialize(response);
			_log.Info($" response: { res }");
			_servicioRepositorio.GuardarLogAfipCpe("RegistrarCaratula", req, res);
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			_log.Info("Finalizando RegistrarCaratula");
			return !response.HayErrores;
        }

        public bool RectificarCaratula(AfipRectificarCaratulaDto request)
        {
			_log.Info("Inicializando RectificarCaratula");
			var req = JsonConverter<AfipRectificarCaratulaDto>.Serialize(request);
			_log.Info($" request: { req }");
			var response = _servicioComandos.Ejecutar(new AfipRectificarCaratula { Dto = request });
			var res = JsonConverter<Resultado>.Serialize(response);
			_log.Info($" response: { res }");
			_servicioRepositorio.GuardarLogAfipCpe("RectificarCaratula", req, res);
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			_log.Info("Finalizando RectificarCaratula");
			return !response.HayErrores;
        }

        public bool AnularCaratula(int id)
        {
			_log.Info("Inicializando AnularCaratula");
			_log.Info($" id: {id}");
			var response = _servicioComandos.Ejecutar(new AfipAnularCaratula { Id = id });
			var res = JsonConverter<Resultado>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("AnularCaratula", id.ToString(), res);
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			_log.Info("Finalizando AnularCaratula");
			return !response.HayErrores;
        }

        public IList<string> ListarEstadosCaratula()
        {
			_log.Info("Inicializando ListarEstadosCaratula");
			Type estadosType = typeof(EstadosCaratulaAFIP);
            var response = estadosType.GetFields().Select(f => (string)f.GetValue(null)).ToList();
			_log.Info("Finalizando ListarEstadosCaratula");
			return response;
        }

        public bool CambiarEstadoCaratula(int id, string estado)
        {
            try
            {
				_log.Info("Inicializando CambiarEstadoCaratula");
				var request = _repositorio.Obtener<AfipCaratula>(id);
                var estados = ListarEstadosCaratula();
                if (request == null)
                {
                    throw new Exception("No existe la carátula con el id indicado");
                }
                if (!estados.Contains(estado))
                {
                    throw new Exception("El estado indicado no es válido");
                }
				request.Estado = estado;
				var req = JsonConverter<AfipCaratula>.Serialize(request);
				_log.Info($" request: {req}");
				var response = _repositorio.GuardarCambios();
				_log.Info($" response: { response }");
				_servicioRepositorio.GuardarLogAfipCpe("CambiarEstadoCaratula", req, response.ToString());
				_log.Info("Finalizando CambiarEstadoCaratula");
				return true;
            }
            catch (Exception e)
            {
                _log.Error($"Error al cambiar estado caratula { e.Message }, { e.InnerException?.Message }");
                return false;
            }
        }

        public IList<AfipCaratulaDto> ComboCaratulas()
        {
            var caratulas = _repositorio.Listar(x => new { x.Id, x.IdentificadorCaratula }, (AfipCaratula x) => true);
            var res = caratulas.Select(x => new AfipCaratulaDto { Id = x.Id, IdentificadorCaratula = x.IdentificadorCaratula }).ToList();
            return res;
        }

        public void CaratulaCambiarTipoProducto(int id)
        {
            var caratula = _repositorio.Obtener<AfipCaratula>(id) ?? throw new Exception("No existe la carátula con el id indicado");
            caratula.EsLiquido = !caratula.EsLiquido;
            _repositorio.GuardarCambios();
        }
        #endregion

        #region COEMs
        public ListaPaginada<AfipCoemDto> ListarCoems(int? idCaratula, Paginacion paginacion, string identificador, string declaracion, string estado)
        {
			_log.Info("Inicializando ListarCoems");
            var request = new ListarAfipCoemConsulta(paginacion, idCaratula, identificador, declaracion, estado);
			var req = JsonConverter<ListarAfipCoemConsulta>.Serialize(request);
			_log.Info($" request: {req}");
			var response = _repositorio.ListarConsultaPaginada(request);
			var res = JsonConverter<ListaPaginada<AfipCoem>>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("ListarCoems", req, res);
			_log.Info("Finalizando ListarCoems");
			return _conversor.ConvertirListaPaginada<AfipCoem, AfipCoemDto>(response);
        }

        public AfipCoemDto ObtenerCoem(int id)
        {
			_log.Info("Inicializando ObtenerCoem");
			_log.Info($" id: { id }");
            var response = Obtener<AfipCoem, AfipCoemDto>(id);
			var res = JsonConverter<AfipCoemDto>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("ObtenerCoem", id.ToString(), res);
			_log.Info("Finalizando ObtenerCoem");
			return response;
        }

        public bool RegistrarCoem(AfipCoemRegistrarRequest coem)
        {
			_log.Info("Inicializando RegistrarCoem");
			var request = _conversor.Convertir<AfipCoemRegistrarRequest, AfipCoemDto>(coem);
			var req = JsonConverter<AfipCoemDto>.Serialize(request);
			_log.Info($" request: {req}");
			var response = _servicioComandos.Ejecutar(new AfipRegistrarCoem { Dto = request });
			var res = JsonConverter<Resultado>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("RegistrarCoem", req, res);
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			_log.Info("Finalizando RegistrarCoem");
			return !response.HayErrores;
        }

        public bool RectificarCoem(AfipCoemDto coem)
        {
			_log.Info("Inicializando RectificarCoem");
            var request = new AfipRectificarCoem { Dto = coem };
			var req = JsonConverter<AfipRectificarCoem>.Serialize(request);
			_log.Info($" request: {req}");
			var response = _servicioComandos.Ejecutar(request);
			var res = JsonConverter<Resultado>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("RectificarCoem", req, res);
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			_log.Info("Finalizando RectificarCoem");
			return !response.HayErrores;
        }

        public bool AnularCoem(int id, int idEstado)
        {
			_log.Info("Inicializando AnularCoem");
            var request = new AfipAnularCoem { Id = id, IdEstado = idEstado };
			var req = JsonConverter<AfipAnularCoem>.Serialize(request);
			_log.Info($" request: {req}");
			var response = _servicioComandos.Ejecutar(request);
			var res = JsonConverter<Resultado>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("AnularCoem", req, res);
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			_log.Info("Finalizando AnularCoem");
			return !response.HayErrores;
        }

        public bool CerrarCoem(int id, int idEstado)
        {
			_log.Info("Inicializando CerrarCoem");
            var request = new AfipCerrarCoem { Id = id, IdEstado = idEstado };
			_log.Info($" request: { JsonConverter<AfipCerrarCoem>.Serialize(request) }");
			var response = _servicioComandos.Ejecutar(request);
			var res = JsonConverter<Resultado>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("CerrarCoem", id.ToString(), res);
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			_log.Info("Finalizando CerrarCoem");
			return !response.HayErrores;
        }

        public bool SolicitarAnulacionCoem(int id)
        {
			_log.Info("Inicializando SolicitarAnulacionCoem");
            var request = new AfipSolicitarAnulacionCoem { Id = id };
			var req = JsonConverter<AfipSolicitarAnulacionCoem>.Serialize(request);
			_log.Info($" request: {req}");
			var response = _servicioComandos.Ejecutar(request);
			var res = JsonConverter<Resultado>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("SolicitarAnulacionCoem", req, res);
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			_log.Info("Finalizando SolicitarAnulacionCoem");
			return !response.HayErrores;
        }

        public IList<AfipCoemEstadoDto> ListarEstadosCoem()
        {
            var estados = Listar<AfipCoemEstado, AfipCoemEstadoDto>();
            return estados.OrderBy(x => x.Orden).ToList();
        }

        public void CambiarEstadoCoem(int idCoem, int idEstado)
        {
            try
            {
                if (ValidarEstados(idCoem, idEstado))
                {
                    var coem = this._repositorio.Obtener<AfipCoem>(idCoem);
                    var estado = this._repositorio.Obtener<AfipCoemEstado>(idEstado);

                    if (coem == null)
                    {
                        throw new Exception("No existe la COEM con el id indicado");
                    }
                    if (estado == null)
                    {
                        throw new Exception("No existe el estado con el ID indicado");
                    }

                    coem.AfipCoemEstado = estado;
                    this._repositorio.GuardarCambios();
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
        public bool SolicitarCierreCargaGranel(AfipSolicitarCierreCargaGranelDto solicitarCierreCargaGranelDto)
        {
			_log.Info("Inicializando SolicitarCierreCargaGranel");
            var request = new AfipSolicitarCierreCargaGranel { Dto = solicitarCierreCargaGranelDto };
			var req = JsonConverter<AfipSolicitarCierreCargaGranel>.Serialize(request);
			_log.Info($" request: {req}");
			var response = _servicioComandos.Ejecutar(request);
			var res = JsonConverter<Resultado>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("SolicitarCierreCargaGranel", req, res);
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			_log.Info("Finalizando SolicitarCierreCargaGranel");
			return !response.HayErrores;
        }

        public IList<AfipSolicitudCierreCargaDto> ListarSolicitudesCierreCarga(int id = 0)
        {
			_log.Info("Inicializando ListarSolicitudesCierreCarga");
			IList<AfipSolicitudCierreCargaDto> response;
			_log.Info($" id: {id}");
			response = Listar<AfipSolicitudCierreCarga, AfipSolicitudCierreCargaDto>(x => id == 0 || x.AfipCaratula.Id == id);
			var res = JsonConverter<IList<AfipSolicitudCierreCargaDto>>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("ListarSolicitudesCierreCarga", id.ToString(), res);
			_log.Info("Finalizando ListarSolicitudesCierreCarga");
			return response.OrderByDescending(x => x.FechaCreacion).ToList();
        }

        public void EfectuarSolicitudCierreCarga(int id)
        {
			_log.Info("Inicializando EfectuarSolicitudCierreCarga");
            var solicitudDb = _repositorio.Obtener<AfipSolicitudCierreCarga>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (solicitudDb.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
			// <ARMOA005-1708 Dylan Lopez>
			//var estadoCoem = _repositorio.Obtener<AfipCoemEstado>((int) EstadosCoemAFIPEnum.CODE) ?? throw new Exception("No existe el estado 'CODE' en la base de datos");
			var estadoCoem = _repositorio.Obtener<AfipCoemEstado>(x => x.Codigo == "CODE") ?? throw new Exception("No existe el estado 'CODE' en la base de datos");
			// </ ARMOA005-1708 Dylan Lopez>
			var caratula = solicitudDb.AfipCaratula;
            foreach (var coem in caratula?.Coems)
            {
                coem.AfipCoemEstado = estadoCoem;
            }
            caratula.Estado = EstadosCaratulaAFIP.Code;
            solicitudDb.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
            solicitudDb.FechaActualizacion = DateTime.Now;
			var res = JsonConverter<AfipSolicitudCierreCarga>.Serialize(solicitudDb);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("EfectuarSolicitudCierreCarga", id.ToString(), res);
			_repositorio.GuardarCambios();
			_log.Info("Finalizando EfectuarSolicitudCierreCarga");
		}

        public void RechazarSolicitudCierreCarga(int id)
        {
			_log.Info("Inicializando RechazarSolicitudCierreCarga");
			var solicitud = _repositorio.Obtener<AfipSolicitudCierreCarga>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (solicitud.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            solicitud.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
            solicitud.FechaActualizacion = DateTime.Now;
			var res = JsonConverter<AfipSolicitudCierreCarga>.Serialize(solicitud);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("RechazarSolicitudCierreCarga", id.ToString(), res);
			_repositorio.GuardarCambios();
			_log.Info("Finalizando RechazarSolicitudCierreCarga");
		}
        #endregion

        #region Solicitar No a bordo
        public bool SolicitarNoAbordo(AfipSolicitarNoAbordoDto solicitarNoAbordoDto)
        {
			_log.Info("Inicializando SolicitarNoAbordo");
            var request = new AfipSolicitarNoAbordo { Dto = solicitarNoAbordoDto };
			_log.Info($" request: { JsonConverter<AfipSolicitarNoAbordo>.Serialize(request) } ");
			var response = _servicioComandos.Ejecutar(request);
            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			_log.Info("Finalizando SolicitarNoAbordo");
			return !response.HayErrores;
        }

        public IList<AfipMotivoNoAbordoDto> ListarMotivosNoAbordo()
        {
			_log.Info("Inicializando ListarMotivosNoAbordo");
            var response = Listar<AfipMotivoNoABordo, AfipMotivoNoAbordoDto>();
			var res = JsonConverter<IList<AfipMotivoNoAbordoDto>>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("ListarMotivosNoAbordo", "", res);
			_log.Info("Finalizando ListarMotivosNoAbordo");
			return response;
        }

        public void EfectuarSolicitudNoABordo(int id)
        {
			_log.Info("Inicializando EfectuarSolicitudNoABordo");
			var response = _repositorio.Obtener<AfipSolicitudNoABordo>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            var declaraciones = response.AfipSolicitudNoABordoDeclaraciones.Select(x => x.AfipCoemMercaderiaSuelta).ToList();
            foreach (var declaracion in declaraciones)
            {
                declaracion.NoABordo = true;
            }
			response.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
			response.FechaActualizacion = DateTime.Now;
			var res = JsonConverter<AfipSolicitudNoABordo>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("EfectuarSolicitudNoABordo", id.ToString(), res);
			_repositorio.GuardarCambios();
			_log.Info("Finalizando EfectuarSolicitudNoABordo");
		}

        public void RechazarSolicitudNoABordo(int id)
        {
			_log.Info("Inicializando RechazarSolicitudNoABordo");
			var response = _repositorio.Obtener<AfipSolicitudNoABordo>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
			response.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
			response.FechaActualizacion = DateTime.Now;
			var res = JsonConverter<AfipSolicitudNoABordo>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("RechazarSolicitudNoABordo", id.ToString(), res);
			_repositorio.GuardarCambios();
			_log.Info("Finalizando RechazarSolicitudNoABordo");
		}
        #endregion

        #region Solicitar Cambio de Buque
        public void SolicitarCambioBuque(AfipSolicitarCambioBuqueDto solicitarCambioBuqueDto)
        {
            var res = this._servicioComandos.Ejecutar(new AfipSolicitarCambioBuque { Dto = solicitarCambioBuqueDto });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
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

        public void EfectuarSolicitudCambioBuque(int id)
        {
			_log.Info("Inicializando EfectuarSolicitudCambioBuque");
			var response = _repositorio.Obtener<AfipSolicitudCambioBuque>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            var caratula = response.AfipCaratula;
            caratula.IdentificadorBuque = response.IdentificadorBuque;
            caratula.NombreMedioTransporte = response.NombreMedioTransporte;
			response.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
			response.FechaActualizacion = DateTime.Now;
			var res = JsonConverter<AfipSolicitudCambioBuque>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("EfectuarSolicitudCambioBuque", id.ToString(), res);
			_repositorio.GuardarCambios();
			_log.Info("Finalizando EfectuarSolicitudCambioBuque");
		}

        public void RechazarSolicitudCambioBuque(int id)
        {
			_log.Info("Inicializando RechazarSolicitudCambioBuque");
			var response = _repositorio.Obtener<AfipSolicitudCambioBuque>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
			response.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
			response.FechaActualizacion = DateTime.Now;
			var res = JsonConverter<AfipSolicitudCambioBuque>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("RechazarSolicitudCambioBuque", id.ToString(), res);
			_repositorio.GuardarCambios();
			_log.Info("Finalizando RechazarSolicitudCambioBuque");
		}
        #endregion

        #region Solicitar Cambio de Fechas
        public void SolicitarCambioFechas(AfipSolicitarCambioFechasDto solicitarCambioFechasDto)
        {
			_log.Info("Inicializando SolicitarCambioFechas");
            var request = new AfipSolicitarCambioFechas { Dto = solicitarCambioFechasDto };
			var req = JsonConverter<AfipSolicitarCambioFechas>.Serialize(request);
			_log.Info($" request: {req}");
			var response = _servicioComandos.Ejecutar(request);
			var res = JsonConverter<Resultado>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("SolicitarCambioFechas", req, res);
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			_log.Info("Finalizando SolicitarCambioFechas");
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

        public void EfectuarSolicitudCambioFechas(int id)
        {
			_log.Info("Inicializando EfectuarSolicitudCambioFechas");
			var response = _repositorio.Obtener<AfipSolicitudCambioFechas>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            var caratula = response.AfipCaratula;
            caratula.FechaArribo = response.FechaArribo;
            caratula.FechaZarpada = response.FechaZarpada;
			response.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
			response.FechaActualizacion = DateTime.Now;
			var res = JsonConverter<AfipSolicitudCambioFechas>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("EfectuarSolicitudCambioFechas", id.ToString(), res);
			_repositorio.GuardarCambios();
			_log.Info("Finalizando EfectuarSolicitudCambioFechas");
		}

        public void RechazarSolicitudCambioFechas(int id)
        {
			_log.Info("Inicializando RechazarSolicitudCambioFechas");
			var response = _repositorio.Obtener<AfipSolicitudCambioFechas>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
			response.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
			response.FechaActualizacion = DateTime.Now;
			var res = JsonConverter<AfipSolicitudCambioFechas>.Serialize(response);
			_log.Info($" response: {res}");
			_servicioRepositorio.GuardarLogAfipCpe("RechazarSolicitudCambioFechas", id.ToString(), res);
			_repositorio.GuardarCambios();
			_log.Info("Finalizando RechazarSolicitudCambioFechas");
		}
        #endregion

        #endregion
    }
}
