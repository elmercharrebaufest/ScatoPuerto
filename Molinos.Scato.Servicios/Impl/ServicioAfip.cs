using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using NPOI.Util;
using System;
using System.Collections.Generic;
using System.DirectoryServices;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Servicios.Enumeradores;
using Molinos.Scato.Dominio.Comandos.AfipPuerto;
using Molinos.Scato.Servicios.Orquestador;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioAfip : IServicioAfip
    {
        private readonly IRepositorio repositorio;
        private readonly IConversor conversor;
        private readonly ILogger log;
        private readonly IServicioComandos servicioComandos;
        private readonly IServicioRepositorio servicioRepositorio;

        public ServicioAfip(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioComandos comandos, IServicioRepositorio servicioRepositorio)
        {
            this.repositorio = repositorio;
            this.conversor = conversor;
            this.log = log;
            this.servicioComandos = comandos;
            this.servicioRepositorio = servicioRepositorio;
        }

        #region Metodos Utiles
        private IList<TDto> Listar<TEntidad, TDto>() where TEntidad : class
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

        public IList<AfipCaratulaDto> ListarCaratulas()
        {
            var caratulas = Listar<AfipCaratula, AfipCaratulaDto>();
            foreach (var caratula in caratulas) caratula.Itinerario = null;
            return caratulas;
        }

        public AfipCaratulaDto ObtenerCaratula(int id)
        {
            var caratula = Obtener<AfipCaratula, AfipCaratulaDto>(id);
            if (caratula.SolicitudesCambioBuque?.Count > 0)
            {
                caratula.SolicitudesCambioBuque = caratula.SolicitudesCambioBuque.OrderByDescending(s => s.FechaCreacion).ToList();
            }
            if (caratula.SolicitudesCambioFechas?.Count > 0)
            {
                caratula.SolicitudesCambioFechas = caratula.SolicitudesCambioFechas.OrderByDescending(s => s.FechaCreacion).ToList();
            }
            return caratula;
        }

        public bool RegistrarCaratula(AfipCaratulaDto caratula)
        {
            var res = this.servicioComandos.Ejecutar(new AfipRegistrarCaratula { Dto = caratula });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            return !res.HayErrores;
        }

        public bool RectificarCaratula(AfipCaratulaDto caratula)
        {
            var res = this.servicioComandos.Ejecutar(new AfipRectificarCaratula { Dto = caratula });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            return !res.HayErrores;
        }

        public bool AnularCaratula(int id)
        {
            var res = this.servicioComandos.Ejecutar(new AfipAnularCaratula { Id = id });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            return !res.HayErrores;
        }

        public IList<string> ListarEstadosCaratula()
        {
            Type estadosType = typeof(EstadosCaratulaAFIP);
            return estadosType.GetFields().Select(f => (string)f.GetValue(null)).ToList();
        }

        public bool CambiarEstadoCaratula(int id, string estado)
        {
            try
            {
                var caratula = this.repositorio.Obtener<AfipCaratula>(id);
                var estados = ListarEstadosCaratula();
                if (caratula == null)
                {
                    throw new Exception("No existe la carátula con el id indicado");
                }
                if (!estados.Contains(estado))
                {
                    throw new Exception("El estado indicado no es válido");
                }
                caratula.Estado = estado;
                var res = this.repositorio.GuardarCambios();
                return true;
            }
            catch (Exception e)
            {
                this.log.Error("Error al cambiar estado caratula {0}", e.StackTrace);
                return false;
            }
        }

        public IList<AfipCaratulaDto> ComboCaratulas()
        {
            var caratulas = repositorio.Listar(x => new { x.Id, x.IdentificadorCaratula }, (AfipCaratula x) => true);
            var res = caratulas.Select(x => new AfipCaratulaDto { Id = x.Id, IdentificadorCaratula = x.IdentificadorCaratula }).ToList();
            return res;
        }
        #endregion

        #region COEMs
        public IList<AfipCoemDto> ListarCoems()
        {
            return Listar<AfipCoem, AfipCoemDto>();
        }

        public IList<AfipCoemDto> ListarCoemsPorCaratula(int idCaratula)
        {
            var caratulas = Listar<AfipCoem, AfipCoemDto>(x => x.AfipCaratula.Id == idCaratula);
            return caratulas;
        }

        public AfipCoemDto ObtenerCoem(int id)
        {
            return Obtener<AfipCoem, AfipCoemDto>(id);
        }

        public bool RegistrarCoem(AfipCoemRegistrarRequest coem)
        {
            var coemDto = this.conversor.Convertir<AfipCoemRegistrarRequest, AfipCoemDto>(coem);
            var res = this.servicioComandos.Ejecutar(new AfipRegistrarCoem { Dto = coemDto });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            return !res.HayErrores;
        }

        public bool RectificarCoem(AfipCoemDto coem)
        {
            var res = this.servicioComandos.Ejecutar(new AfipRectificarCoem { Dto = coem });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            return !res.HayErrores;
        }

        public bool AnularCoem(int id, int idEstado)
        {
            var res = this.servicioComandos.Ejecutar(new AfipAnularCoem { Id = id, IdEstado = idEstado });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            return !res.HayErrores;
        }

        public bool CerrarCoem(int id, int idEstado)
        {
            var res = this.servicioComandos.Ejecutar(new AfipCerrarCoem { Id = id, IdEstado = idEstado });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            return !res.HayErrores;
        }

        public bool SolicitarAnulacionCoem(int id)
        {
            var res = this.servicioComandos.Ejecutar(new AfipSolicitarAnulacionCoem { Id = id });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            return !res.HayErrores;
        }

        public IList<AfipCoemEstadoDto> ListarEstadosCoem()
        {
            return Listar<AfipCoemEstado, AfipCoemEstadoDto>();
        }

        public void CambiarEstadoCoem(int idCoem, int idEstado)
        {
            try
            {
                if(ValidarEstados(idCoem, idEstado))
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
            return Listar<AfipCode, AfipCodeDto>();
        }

        public AfipCodeDto ObtenerCode(int id)
        {
            return Obtener<AfipCode, AfipCodeDto>(id);
        }

        public void RegistrarCode(AfipCodeDto code)
        {
            this.servicioComandos.Ejecutar(new AfipRegistrarCode { Dto = code });
        }
        #endregion

        #region Solicitudes

        public bool SolicitarCierreCargaGranel(AfipSolicitarCierreCargaGranelDto solicitarCierreCargaGranelDto)
        {
            var res = this.servicioComandos.Ejecutar(new AfipSolicitarCierreCargaGranel { Dto = solicitarCierreCargaGranelDto });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            return !res.HayErrores;
        }

        public bool SolicitarNoAbordo(AfipSolicitarNoAbordoDto solicitarNoAbordoDto)
        {
            var res = this.servicioComandos.Ejecutar(new AfipSolicitarNoAbordo { Dto = solicitarNoAbordoDto });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
            return !res.HayErrores;
        }

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
            var solicitud = repositorio.Obtener<AfipSolicitudCambioBuque>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (solicitud.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            var caratula = solicitud.AfipCaratula;
            caratula.IdentificadorBuque = solicitud.IdentificadorBuque;
            caratula.NombreMedioTransporte = solicitud.NombreMedioTransporte;
            solicitud.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
            solicitud.FechaActualizacion = DateTime.Now;
            repositorio.GuardarCambios();
        }

        public void RechazarSolicitudCambioBuque(int id)
        {
            var solicitud = repositorio.Obtener<AfipSolicitudCambioBuque>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (solicitud.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            solicitud.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
            solicitud.FechaActualizacion = DateTime.Now;
            repositorio.GuardarCambios();
        }
        #endregion

        #region Solicitar Cambio de Fechas
        public void SolicitarCambioFechas(AfipSolicitarCambioFechasDto solicitarCambioFechasDto)
        {
            var res = this.servicioComandos.Ejecutar(new AfipSolicitarCambioFechas { Dto = solicitarCambioFechasDto });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
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
            var solicitud = repositorio.Obtener<AfipSolicitudCambioFechas>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (solicitud.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            var caratula = solicitud.AfipCaratula;
            caratula.FechaArribo = solicitud.FechaArribo;
            caratula.FechaZarpada = solicitud.FechaZarpada;
            solicitud.Estado = (int)EstadosSolicitudesAFIP.Aceptado;
            solicitud.FechaActualizacion = DateTime.Now;
            repositorio.GuardarCambios();
        }

        public void RechazarSolicitudCambioFechas(int id)
        {
            var solicitud = repositorio.Obtener<AfipSolicitudCambioFechas>(id) ?? throw new Exception("No se ha encontrado la solicitud indicada");
            if (solicitud.Estado != (int)EstadosSolicitudesAFIP.Pendiente) { throw new Exception("La solicitud indicada ya no está pendiente"); }
            solicitud.Estado = (int)EstadosSolicitudesAFIP.Rechazado;
            solicitud.FechaActualizacion = DateTime.Now;
            repositorio.GuardarCambios();
        }
        #endregion

        #endregion
    }
}
