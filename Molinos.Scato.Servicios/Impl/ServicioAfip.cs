using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Dto.AfipTablasReferencia;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioAfip : IServicioAfip
    {
        private readonly IRepositorio repositorio;
        private readonly IConversor conversor;
        private readonly ILogger log;
        private readonly IServicioComandos servicioComandos;
        private readonly IServicioRepositorio servicioRepositorio;

        public ServicioAfip(
            IRepositorio repositorio, 
            IConversor conversor, 
            ILogger log, 
            IServicioComandos comandos, 
            IServicioRepositorio servicioRepositorio
        )
        {
            this.repositorio = repositorio;
            this.conversor = conversor;
            this.log = log;
            this.servicioComandos = comandos;
            this.servicioRepositorio = servicioRepositorio;
        }

        #region Metodos Utiles
        public IList<TDto> Listar<TEntidad, TDto>() where TEntidad : class
        {
            return conversor.ConvertirList<TEntidad, TDto>(repositorio.Listar<TEntidad>());
        }
        private IList<TDto> Listar<TEntidad, TDto>(Expression<Func<TEntidad, bool>> expresionFiltro) where TEntidad : class
        {
            return conversor.ConvertirList<TEntidad, TDto>(repositorio.Listar(expresionFiltro));
        }
        private TDto Obtener<TEntidad, TDto>(int id) where TEntidad : class
        {
            return conversor.Convertir<TEntidad, TDto>(repositorio.Obtener<TEntidad>(id));
        }
        private TDto Obtener<TEntidad, TDto>(Expression<Func<TEntidad, bool>> expresionFiltro) where TEntidad : class
        {
            return conversor.Convertir<TEntidad, TDto>(repositorio.Obtener(expresionFiltro));
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
			log.Info("Inicializando ListarCaratulas");
            var request = new ListarAfipCaratulaConsulta(paginacion, fechaArribo, buque, identificador, estado);
			log.Info($" request: { JsonConverter<ListarAfipCaratulaConsulta>.Serialize(request) }");
			var response = repositorio.ListarConsultaPaginada(request);
			log.Info($" response: { JsonConverter<ListaPaginada<AfipCaratula>>.Serialize(response) }");
			log.Info("Finalizando ListarCaratulas");
			return conversor.ConvertirListaPaginada<AfipCaratula, AfipCaratulaDto>(response);
        }

        public AfipCaratulaDto ObtenerCaratula(int id)
        {
			log.Info("Inicializando ObtenerCaratula");
			log.Info($" id: { id }");
			var response = Obtener<AfipCaratula, AfipCaratulaDto>(id);
            if (response.SolicitudesCambioBuque?.Count > 0)
            {
				response.SolicitudesCambioBuque = response.SolicitudesCambioBuque.OrderByDescending(s => s.FechaCreacion).ToList();
            }
            if (response.SolicitudesCambioFechas?.Count > 0)
            {
				response.SolicitudesCambioFechas = response.SolicitudesCambioFechas.OrderByDescending(s => s.FechaCreacion).ToList();
            }
			log.Info($" response: { JsonConverter<AfipCaratulaDto>.Serialize(response) }");
			log.Info("Finalizando ObtenerCaratula");
			return response;
        }

        public bool RegistrarCaratula(AfipRegistrarCaratulaDto request)
        {
			log.Info("Inicializando RegistrarCaratula");
			log.Info($" request: { JsonConverter<AfipRegistrarCaratulaDto>.Serialize(request) }");
			var response = servicioComandos.Ejecutar(new AfipRegistrarCaratula { Dto = request });
			log.Info($" response: { JsonConverter<Resultado>.Serialize(response) }");
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			log.Info("Finalizando RegistrarCaratula");
			return !response.HayErrores;
        }

        public bool RectificarCaratula(AfipRectificarCaratulaDto request)
        {
			log.Info("Inicializando RectificarCaratula");
			log.Info($" request: { JsonConverter<AfipRectificarCaratulaDto>.Serialize(request) }");
			var response = servicioComandos.Ejecutar(new AfipRectificarCaratula { Dto = request });
			log.Info($" response: { JsonConverter<Resultado>.Serialize(response) }");
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			log.Info("Finalizando RectificarCaratula");
			return !response.HayErrores;
        }

        public bool AnularCaratula(int id)
        {
			log.Info("Inicializando AnularCaratula");
			log.Info($" id: {id}");
			var response = servicioComandos.Ejecutar(new AfipAnularCaratula { Id = id });
			log.Info($" response: { JsonConverter<Resultado>.Serialize(response) }");
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			log.Info("Finalizando AnularCaratula");
			return !response.HayErrores;
        }

        public IList<string> ListarEstadosCaratula()
        {
			log.Info("Inicializando ListarEstadosCaratula");
			Type estadosType = typeof(EstadosCaratulaAFIP);
            var response = estadosType.GetFields().Select(f => (string)f.GetValue(null)).ToList();
			log.Info("Finalizando ListarEstadosCaratula");
			return response;
        }

        public bool CambiarEstadoCaratula(int id, string estado)
        {
            try
            {
				log.Info("Inicializando CambiarEstadoCaratula");
				var request = repositorio.Obtener<AfipCaratula>(id);
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
				log.Info($" request: { JsonConverter<AfipCaratula>.Serialize(request) }");
				var response = repositorio.GuardarCambios();
				log.Info($" response: { response }");
				log.Info("Finalizando CambiarEstadoCaratula");
				return true;
            }
            catch (Exception e)
            {
                log.Error($"Error al cambiar estado caratula { e.Message }, { e.InnerException?.Message }");
                return false;
            }
        }

        public IList<AfipCaratulaDto> ComboCaratulas()
        {
            var caratulas = repositorio.Listar(x => new { x.Id, x.IdentificadorCaratula }, (AfipCaratula x) => true);
            var res = caratulas.Select(x => new AfipCaratulaDto { Id = x.Id, IdentificadorCaratula = x.IdentificadorCaratula }).ToList();
            return res;
        }

        public void CaratulaCambiarTipoProducto(int id)
        {
            var caratula = repositorio.Obtener<AfipCaratula>(id) ?? throw new Exception("No existe la carátula con el id indicado");
            caratula.EsLiquido = !caratula.EsLiquido;
            repositorio.GuardarCambios();
        }
        #endregion

        #region COEMs
        public ListaPaginada<AfipCoemDto> ListarCoems(int? idCaratula, Paginacion paginacion, string identificador, string declaracion, string estado)
        {
			log.Info("Inicializando ListarCoems");
            var request = new ListarAfipCoemConsulta(paginacion, idCaratula, identificador, declaracion, estado);
			log.Info($" request: { JsonConverter<ListarAfipCoemConsulta>.Serialize(request) }");
			var response = repositorio.ListarConsultaPaginada(request);
			log.Info($" response: { JsonConverter<ListaPaginada<AfipCoem>>.Serialize(response) }");
			log.Info("Finalizando ListarCoems");
			return conversor.ConvertirListaPaginada<AfipCoem, AfipCoemDto>(response);
        }

        public AfipCoemDto ObtenerCoem(int id)
        {
			log.Info("Inicializando ObtenerCoem");
			log.Info($" id: { id }");
            var response = Obtener<AfipCoem, AfipCoemDto>(id);
			log.Info($" response: { JsonConverter<AfipCoemDto>.Serialize(response) }");
			log.Info("Finalizando ObtenerCoem");
			return response;
        }

        public bool RegistrarCoem(AfipCoemRegistrarRequest coem)
        {
			log.Info("Inicializando RegistrarCoem");
			var request = conversor.Convertir<AfipCoemRegistrarRequest, AfipCoemDto>(coem);
			log.Info($" request: { JsonConverter<AfipCoemDto>.Serialize(request) }");
			var response = servicioComandos.Ejecutar(new AfipRegistrarCoem { Dto = request });
			log.Info($" response: { JsonConverter<Resultado>.Serialize(response) }");
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			log.Info("Finalizando RegistrarCoem");
			return !response.HayErrores;
        }

        public bool RectificarCoem(AfipCoemDto coem)
        {
			log.Info("Inicializando RectificarCoem");
            var request = new AfipRectificarCoem { Dto = coem };
			log.Info($" request: { JsonConverter<AfipRectificarCoem>.Serialize(request) }");
			var response = servicioComandos.Ejecutar(request);
			log.Info($" response: { JsonConverter<Resultado>.Serialize(response) }");
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			log.Info("Finalizando RectificarCoem");
			return !response.HayErrores;
        }

        public bool AnularCoem(int id, int idEstado)
        {
			log.Info("Inicializando AnularCoem");
            var request = new AfipAnularCoem { Id = id, IdEstado = idEstado };
			log.Info($" request: { JsonConverter<AfipAnularCoem>.Serialize(request) }");
			var response = servicioComandos.Ejecutar(request);
			log.Info($" response: { JsonConverter<Resultado>.Serialize(response) }");
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			log.Info("Finalizando AnularCoem");
			return !response.HayErrores;
        }

        public bool CerrarCoem(int id, int idEstado)
        {
			log.Info("Inicializando CerrarCoem");
            var request = new AfipCerrarCoem { Id = id, IdEstado = idEstado };
			log.Info($" request: { JsonConverter<AfipCerrarCoem>.Serialize(request) }");
			var response = servicioComandos.Ejecutar(request);
			log.Info($" response: { JsonConverter<Resultado>.Serialize(response) }");
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			log.Info("Finalizando CerrarCoem");
			return !response.HayErrores;
        }

        public bool SolicitarAnulacionCoem(int id)
        {
			log.Info("Inicializando SolicitarAnulacionCoem");
            var request = new AfipSolicitarAnulacionCoem { Id = id };
			log.Info($" request: { JsonConverter<AfipSolicitarAnulacionCoem>.Serialize(request) }");
			var response = servicioComandos.Ejecutar(request);
			log.Info($" response: { JsonConverter<Resultado>.Serialize(response) }");
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			log.Info("Finalizando SolicitarAnulacionCoem");
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
                    var coem = this.repositorio.Obtener<AfipCoem>(idCoem);
                    var estado = this.repositorio.Obtener<AfipCoemEstado>(idEstado);

                    if (coem == null)
                    {
                        throw new Exception("No existe la COEM con el id indicado");
                    }
                    if (estado == null)
                    {
                        throw new Exception("No existe el estado con el ID indicado");
                    }

                    coem.AfipCoemEstado = estado;
                    this.repositorio.GuardarCambios();
                }
            }
            catch (Exception ex)
            {
                this.log.Error("Error al cambiar estado de la COEM {0}", ex.StackTrace);
                throw new Exception("Error al cambiar estado de la COEM");
            }

        }

        private bool ValidarEstados(int idCoem, int idEstado)
        {
            var retorno = true;
            var estadoActual = this.repositorio.Obtener<AfipCoem>(idCoem).AfipCoemEstado;
            var estadoSeleccionado = this.repositorio.Obtener<AfipCoemEstado>(idEstado);

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
			log.Info("Inicializando ListarCode");
            var response = Listar<AfipCode, AfipCodeDto>();
			log.Info($" response: { JsonConverter<IList<AfipCodeDto>>.Serialize(response) }");
			log.Info("Finalizando ListarCode");
            return response;
		}

        public AfipCodeDto ObtenerCode(int id)
        {
			log.Info("Inicializando ObtenerCode");
			log.Info($" id: {id}");
            var response = Obtener<AfipCode, AfipCodeDto>(id);
			log.Info($" response: { JsonConverter<AfipCodeDto>.Serialize(response) }");
			log.Info("Finalizando ObtenerCode");
            return response;
		}

        public void RegistrarCode(AfipCodeDto code)
        {
			log.Info("Inicializando RegistrarCode");
			var request = new AfipRegistrarCode { Dto = code };
			log.Info($" request: { JsonConverter<AfipRegistrarCode>.Serialize(request) }");
			servicioComandos.Ejecutar(request);
			log.Info("Finalizando RegistrarCode");
		}
        #endregion

        #region Solicitudes

        #region Solicitar Cierre de Carga
        public bool SolicitarCierreCargaGranel(AfipSolicitarCierreCargaGranelDto solicitarCierreCargaGranelDto)
        {
			log.Info("Inicializando SolicitarCierreCargaGranel");
            var request = new AfipSolicitarCierreCargaGranel { Dto = solicitarCierreCargaGranelDto };
			log.Info($" request: { JsonConverter<AfipSolicitarCierreCargaGranel>.Serialize(request) } ");
			var response = servicioComandos.Ejecutar(request);
			log.Info($" response: { JsonConverter<Resultado>.Serialize(response) }");
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			log.Info("Finalizando SolicitarCierreCargaGranel");
			return !response.HayErrores;
        }

        public IList<AfipSolicitudCierreCargaDto> ListarSolicitudesCierreCarga(int id = 0)
        {
			log.Info("Inicializando ListarSolicitudesCierreCarga");
			IList<AfipSolicitudCierreCargaDto> response;
			log.Info($" id: {id}");
			response = Listar<AfipSolicitudCierreCarga, AfipSolicitudCierreCargaDto>(x => id == 0 || x.AfipCaratula.Id == id);
			log.Info($" response: { JsonConverter<IList<AfipSolicitudCierreCargaDto>>.Serialize(response) }");
			log.Info("Finalizando ListarSolicitudesCierreCarga");
			return response.OrderByDescending(x => x.FechaCreacion).ToList();
        }

        public void EfectuarSolicitudCierreCarga(int id)
        {
			log.Info("Inicializando EfectuarSolicitudCierreCarga");
            var a = repositorio.Obtener<AfipCoemEstado>((int) EstadosCoemAFIPEnum.CODE);
            var solicitudDb = repositorio.Obtener<AfipSolicitudCierreCarga>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (solicitudDb.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
			// <ARMOA005-1708 Dylan Lopez>
			//var estadoCoem = repositorio.Obtener<AfipCoemEstado>(estado => estado.Codigo == "CODE") ?? throw new Exception("No existe el estado 'CODE' en la base de datos");
			var estadoCoem = repositorio.Obtener<AfipCoemEstado>((int) EstadosCoemAFIPEnum.CODE) ?? throw new Exception("No existe el estado 'CODE' en la base de datos");
			// </ ARMOA005-1708 Dylan Lopez>
			var caratula = solicitudDb.AfipCaratula;
            foreach (var coem in caratula?.Coems)
            {
                coem.AfipCoemEstado = estadoCoem;
            }
            caratula.Estado = EstadosCaratulaAFIP.Code;
            solicitudDb.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
            solicitudDb.FechaActualizacion = DateTime.Now;
			log.Info($" response: { JsonConverter<AfipSolicitudCierreCarga>.Serialize(solicitudDb) }");
			repositorio.GuardarCambios();
			log.Info("Finalizando EfectuarSolicitudCierreCarga");
		}

        public void RechazarSolicitudCierreCarga(int id)
        {
			log.Info("Inicializando RechazarSolicitudCierreCarga");
			var solicitud = repositorio.Obtener<AfipSolicitudCierreCarga>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (solicitud.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            solicitud.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
            solicitud.FechaActualizacion = DateTime.Now;
			log.Info($" response: { JsonConverter<AfipSolicitudCierreCarga>.Serialize(solicitud) }");
			repositorio.GuardarCambios();
			log.Info("Finalizando RechazarSolicitudCierreCarga");
		}
        #endregion

        #region Solicitar No a bordo
        public bool SolicitarNoAbordo(AfipSolicitarNoAbordoDto solicitarNoAbordoDto)
        {
			log.Info("Inicializando SolicitarNoAbordo");
            var request = new AfipSolicitarNoAbordo { Dto = solicitarNoAbordoDto };
			log.Info($" request: { JsonConverter<AfipSolicitarNoAbordo>.Serialize(request) } ");
			var response = servicioComandos.Ejecutar(request);
            if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			log.Info("Finalizando SolicitarNoAbordo");
			return !response.HayErrores;
        }

        public IList<AfipMotivoNoAbordoDto> ListarMotivosNoAbordo()
        {
			log.Info("Inicializando ListarMotivosNoAbordo");
            var response = Listar<AfipMotivoNoABordo, AfipMotivoNoAbordoDto>();
			log.Info($" response: { JsonConverter<IList<AfipMotivoNoAbordoDto>>.Serialize(response) }");
			log.Info("Finalizando ListarMotivosNoAbordo");
			return response;
        }

        public void EfectuarSolicitudNoABordo(int id)
        {
			log.Info("Inicializando EfectuarSolicitudNoABordo");
			var response = repositorio.Obtener<AfipSolicitudNoABordo>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            var declaraciones = response.AfipSolicitudNoABordoDeclaraciones.Select(x => x.AfipCoemMercaderiaSuelta).ToList();
            foreach (var declaracion in declaraciones)
            {
                declaracion.NoABordo = true;
            }
			response.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
			response.FechaActualizacion = DateTime.Now;
			log.Info($" response: { JsonConverter<AfipSolicitudNoABordo>.Serialize(response) }");
			repositorio.GuardarCambios();
			log.Info("Finalizando EfectuarSolicitudNoABordo");
		}

        public void RechazarSolicitudNoABordo(int id)
        {
			log.Info("Inicializando RechazarSolicitudNoABordo");
			var response = repositorio.Obtener<AfipSolicitudNoABordo>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
			response.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
			response.FechaActualizacion = DateTime.Now;
			log.Info($" response: { JsonConverter<AfipSolicitudNoABordo>.Serialize(response) }");
			repositorio.GuardarCambios();
			log.Info("Finalizando RechazarSolicitudNoABordo");
		}
        #endregion

        #region Solicitar Cambio de Buque
        public void SolicitarCambioBuque(AfipSolicitarCambioBuqueDto solicitarCambioBuqueDto)
        {
            var res = this.servicioComandos.Ejecutar(new AfipSolicitarCambioBuque { Dto = solicitarCambioBuqueDto });
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
			log.Info("Inicializando EfectuarSolicitudCambioBuque");
			var response = repositorio.Obtener<AfipSolicitudCambioBuque>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            var caratula = response.AfipCaratula;
            caratula.IdentificadorBuque = response.IdentificadorBuque;
            caratula.NombreMedioTransporte = response.NombreMedioTransporte;
			response.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
			response.FechaActualizacion = DateTime.Now;
			log.Info($" response: { JsonConverter<AfipSolicitudCambioBuque>.Serialize(response) }");
			repositorio.GuardarCambios();
			log.Info("Finalizando EfectuarSolicitudCambioBuque");
		}

        public void RechazarSolicitudCambioBuque(int id)
        {
			log.Info("Inicializando RechazarSolicitudCambioBuque");
			var response = repositorio.Obtener<AfipSolicitudCambioBuque>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
			response.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
			response.FechaActualizacion = DateTime.Now;
			log.Info($" response: { JsonConverter<AfipSolicitudCambioBuque>.Serialize(response) }");
			repositorio.GuardarCambios();
			log.Info("Finalizando RechazarSolicitudCambioBuque");
		}
        #endregion

        #region Solicitar Cambio de Fechas
        public void SolicitarCambioFechas(AfipSolicitarCambioFechasDto solicitarCambioFechasDto)
        {
			log.Info("Inicializando SolicitarCambioFechas");
            var request = new AfipSolicitarCambioFechas { Dto = solicitarCambioFechasDto };
			var response = servicioComandos.Ejecutar(request);
			log.Info($" response: {JsonConverter<Resultado>.Serialize(response)}");
			if (response.HayErrores)
            {
                throw new Exception(response.Errores[""]);
            }
			log.Info("Finalizando SolicitarCambioFechas");
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
			log.Info("Inicializando EfectuarSolicitudCambioFechas");
			var response = repositorio.Obtener<AfipSolicitudCambioFechas>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            var caratula = response.AfipCaratula;
            caratula.FechaArribo = response.FechaArribo;
            caratula.FechaZarpada = response.FechaZarpada;
			response.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
			response.FechaActualizacion = DateTime.Now;
			log.Info($" response: {JsonConverter<AfipSolicitudCambioFechas>.Serialize(response)}");
			repositorio.GuardarCambios();
			log.Info("Finalizando EfectuarSolicitudCambioFechas");
		}

        public void RechazarSolicitudCambioFechas(int id)
        {
			log.Info("Inicializando RechazarSolicitudCambioFechas");
			var response = repositorio.Obtener<AfipSolicitudCambioFechas>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (response.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
			response.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
			response.FechaActualizacion = DateTime.Now;
			log.Info($" response: {JsonConverter<AfipSolicitudCambioFechas>.Serialize(response)}");
			repositorio.GuardarCambios();
			log.Info("Finalizando RechazarSolicitudCambioFechas");
		}
        #endregion

        #endregion
    }
}
