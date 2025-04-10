using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto.Administracion;
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
                //Tanque?
                Exportadores = _servicioRepositorio.ListaExportadores().ToList(),
                Clientes = _servicioRepositorio.ListarCoordinadores().ToList(),
                Productos = _servicioRepositorio.ListaMaterialesPuerto().ToList()
            };
            return response;
        }

        public ListaPaginada<AdministracionEmbarqueDto> ListarEmbarquesAdministracion(Paginacion paginacion, DateTime? desamarre = null,
            string buques = null, string muelles = null, string tanques = null, string exportadores = null, string clientes = null,
            string materiales = null, string estados = null)
        {
            List<string> listaBuques = string.IsNullOrEmpty(buques) ? new List<string>() : buques.Split(',').ToList();
            List<string> listaMuelles = string.IsNullOrEmpty(muelles) ? new List<string>() : muelles.Split(',').ToList();
            List<string> listaExportadores = string.IsNullOrEmpty(exportadores) ? new List<string>() : exportadores.Split(',').ToList();
            List<string> listaClientes = string.IsNullOrEmpty(clientes) ? new List<string>() : clientes.Split(',').ToList();
            List<string> listaMateriales = string.IsNullOrEmpty(materiales) ? new List<string>() : materiales.Split(',').ToList();
            List<string> listaEstados;
            tanques = string.IsNullOrEmpty(tanques) || tanques == "TODOS" ? null : tanques;
            if (string.IsNullOrEmpty(estados) || estados == "TODOS")
            {
                listaEstados = null;
            }
            else if (estados == "SIN FACTURAR")
            {
                listaEstados = new List<string> { "EN OPERACIONES", "EN CALIDAD", "EN RECIBIDORES", "A FACTURAR" };
            }
            else
            {
                listaEstados = new List<string> { "FACTURADO" };
            }
            var listaPaginada = this._repositorio.ListarConsultaPaginada(new ListarEmbarquesAdministracionConsulta(paginacion, desamarre, listaBuques, listaMuelles, tanques, listaExportadores, listaClientes,
                listaMateriales, listaEstados));
            return listaPaginada;
        }

        public List<AdministracionEmbarqueDto> ListarEmbarquesAdministracionSinPaginar(DateTime? desamarre = null,
            string buques = null, string muelles = null, string tanques = null, string exportadores = null, string clientes = null,
            string materiales = null, string estados = null)
        {
            List<string> listaBuques = string.IsNullOrEmpty(buques) ? new List<string>() : buques.Split(',').ToList();
            List<string> listaMuelles = string.IsNullOrEmpty(muelles) ? new List<string>() : muelles.Split(',').ToList();
            List<string> listaExportadores = string.IsNullOrEmpty(exportadores) ? new List<string>() : exportadores.Split(',').ToList();
            List<string> listaClientes = string.IsNullOrEmpty(clientes) ? new List<string>() : clientes.Split(',').ToList();
            List<string> listaMateriales = string.IsNullOrEmpty(materiales) ? new List<string>() : materiales.Split(',').ToList();
            List<string> listaEstados;
            tanques = string.IsNullOrEmpty(tanques) || tanques == "TODOS" ? null : tanques;
            if (string.IsNullOrEmpty(estados) || estados == "TODOS")
            {
                listaEstados = null;
            }
            else if (estados == "SIN FACTURAR")
            {
                listaEstados = new List<string> { "EN OPERACIONES", "EN CALIDAD", "EN RECIBIDORES", "A FACTURAR" };
            }
            else
            {
                listaEstados = new List<string> { "FACTURADO" };
            }

            var paginacion = new Paginacion();

            var lista = this._repositorio.ListarConsultaPaginada(new ListarEmbarquesAdministracionConsulta(paginacion, desamarre, listaBuques, listaMuelles, tanques, listaExportadores, listaClientes,
                listaMateriales, listaEstados));
            return lista.Items.ToList();
        }
    }
}