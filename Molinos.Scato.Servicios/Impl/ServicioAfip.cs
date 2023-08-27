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
using Molinos.Scato.Dominio.Comandos.AfipPuerto;

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

        #region Caratulas

        public IList<AfipCaratulaDto> ListarCaratulas()
        {
            var caratulas = Listar<AfipCaratula, AfipCaratulaDto>();
            foreach (var caratula in caratulas) caratula.Itinerario = null;
            return caratulas;
        }

        public AfipCaratulaDto ObtenerCaratula(int id)
        {
            return Obtener<AfipCaratula, AfipCaratulaDto>(id);
        }

        public bool RegistrarCaratula(AfipCaratulaDto caratula)
        {
            var res = this.servicioComandos.Ejecutar(new AfipRegistrarCaratula { Dto = caratula });
            return !res.HayErrores;
        }

        public IList<AfipCaratulaEstadoDto> ListarEstadosCaratula()
        {
            return Listar<AfipCaratulaEstado, AfipCaratulaEstadoDto>();
        }

        public bool CambiarEstadoCaratula(int id, int idEstado)
        {
            try
            {
                var caratula = this.repositorio.Obtener<AfipCaratula>(id);
                var estadoDb = this.repositorio.Obtener<AfipCaratulaEstado>(idEstado);
                caratula.AfipCaratulaEstado = estadoDb;
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
            foreach (var caratula in caratulas)
            {
                caratula.MercaderiasSueltas = null;
                caratula.ContenedoresConCarga = null;
                caratula.ContenedoresVacios = null;
            }
            return caratulas;
        }

        public AfipCoemDto ObtenerCoem(int id)
        {
            return Obtener<AfipCoem, AfipCoemDto>(id);
        }

        public void RegistrarCoem(AfipCoemDto coem)
        {
            this.servicioComandos.Ejecutar(new AfipRegistrarCoem { Dto = coem });
        }

        public void RectificarCoem(AfipCoemDto coem)
        {
            this.servicioComandos.Ejecutar(new AfipRectificarCoem { Dto = coem });
        }

        public IList<AfipCoemEstadoDto> ListarEstadosCoem()
        {
            return Listar<AfipCoemEstado, AfipCoemEstadoDto>();
        }

        public void CambiarEstadoCoem(int idCoem, int idEstado)
        {
            var coem = this.repositorio.Obtener<AfipCoem>(idCoem);
            var estado = this.repositorio.Obtener<AfipCoemEstado>(idEstado);
            coem.AfipCoemEstado = estado;
            this.repositorio.GuardarCambios();
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
    }
}
