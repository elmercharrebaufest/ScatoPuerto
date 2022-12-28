using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

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
                if (nominacion != null)
                {
                    nominacion.Embarque = null;
                }
                return nominacion;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        
        public IList<VaporInformacionDto> listarVaporInformacion()
        {
            try
            {
                return Listar<VaporInformacion, VaporInformacionDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<MaterialPuertoDto> listarMaterialPuerto()
        {
            try
            {
                return Listar<MaterialPuerto, MaterialPuertoDto>(x => x.DescripcionCorta != null);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<DestinoDto> listarDestino()
        {
            try
            {
                return Listar<Destino, DestinoDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<ExportadorDto> listarExportador()
        {
            try
            {
                return Listar<Exportador, ExportadorDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<CoordinadorPuertoDto> listarCoordinadorPuerto()
        {
            try
            {
                return Listar<CoordinadorPuerto, CoordinadorPuertoDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<BanderaDto> listarBandera()
        {
            try
            {
                return Listar<Bandera, BanderaDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        
        public IList<ATAPuertoDto> listarATAPuerto()
        {
            try
            {
                return Listar<ATAPuerto, ATAPuertoDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public IList<AgenciaMaritimaPuertoDto> listarAgenciaMaritimaPuerto()
        {
            try
            {
                return Listar<AgenciaMaritimaPuerto, AgenciaMaritimaPuertoDto>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool ValidarCreacionNominacion(NominacionValidaDto nominacion)
        {
            bool bValidacion = true;
            var listaNominaciones = Listar<Nominacion, NominacionDto>(x => x.NominacionDatoTecnico.MaterialPuerto.Id == nominacion.MaterialPuerto.Id &&
                                                                      x.NominacionDatoTecnico.VaporInformacion.Id == nominacion.VaporInformacion.Id &&
                                                                      x.NominacionDatoTecnico.MuelleDeCarga.Id == nominacion.MuelleDeCarga.Id &&
                                                                      x.Id != nominacion.Id);
            if (listaNominaciones.Count > 1) bValidacion = false;
            return bValidacion;
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

    }
}