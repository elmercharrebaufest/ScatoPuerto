using Microsoft.Web.Administration;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Filtros;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Helpers;
using Molinos.Scato.Servicios.Orquestador;
using Molinos.Scato.Servicios.ServiciosSap;
using Ninject.Extensions.Logging;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using System;
using System.Collections.Generic;
using System.Data.Objects;
using System.Data.Objects.SqlClient;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Printing;
using System.ServiceModel.Configuration;
using WebConfigurationManager = System.Web.Configuration.WebConfigurationManager;
using System.DirectoryServices;
using System.Security.Principal;
using System.DirectoryServices.AccountManagement;
using NPOI.SS.Formula.Functions;
using System.Drawing.Text;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioProgramaEmbarque : IServicioProgramaEmbarque
    {
        private readonly IRepositorio repositorio;
        private readonly IConversor conversor;
        private readonly ILogger log;

        public ServicioProgramaEmbarque(IRepositorio repositorio, IConversor conversor, ILogger log)
        {
            this.repositorio = repositorio;
            this.conversor = conversor;
            this.log = log;

        }

        public ListaPaginada<ProgramaEmbarqueDto> ListarProgramaDeEmbarque(Paginacion paginacion, DateTime? fecha = null, List<string> muelle = null, List<string> buque = null, List<string> producto = null)
        {
            var fechaHasta = fecha.HasValue ? new DateTime(fecha.Value.Year, fecha.Value.Month, DateTime.DaysInMonth(fecha.Value.Year, fecha.Value.Month)) : (DateTime?)null;
            return repositorio.ListarConsultaPaginada(new ListarProgramaEmbarqueConsulta(paginacion, fecha, buque, muelle, producto));

        }

        public ProgramaEmbarqueDto ListarDatosCombo()
        {
            return repositorio.ObtenerConsultaEscalar(new ListarProgramaEmbarqueCombos());
        }

        public IList<CalidadValorDto> listarCalidadValor()
        {
            try
            {
                return Listar<CalidadValor, CalidadValorDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<TipoDeCalidadDto> listarTipoDeCalidad()
        {
            try
            {
                return Listar<TipoDeCalidad, TipoDeCalidadDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<MuelleDeCargaDto> listarMuelleDeCarga()
        {
            try
            {
                return Listar<MuelleDeCarga, MuelleDeCargaDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<SurveyorDto> listarSurveyor()
        {
            try
            {
                return Listar<Surveyor, SurveyorDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<TasaDeCargaDto> listarTasaDeCarga()
        {
            try
            {
                return Listar<TasaDeCarga, TasaDeCargaDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<TipoDeContratoDto> listarTipoDeContrato()
        {
            try
            {
                return Listar<TipoDeContrato, TipoDeContratoDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public NominacionDto ObtenerNominacion(int id)
        {
            try
            {
                var nominacion = Obtener<Nominacion, NominacionDto>(id);
                nominacion.Embarque = null;
                return nominacion;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

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
    }
}