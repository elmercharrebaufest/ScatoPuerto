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

        public IList<AfipCaratulaDto> ListarCaratulas()
        {
            return Listar<AfipCaratula, AfipCaratulaDto>();
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
    }
}
