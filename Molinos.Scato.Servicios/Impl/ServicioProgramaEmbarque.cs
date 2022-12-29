using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
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

        public IList<NominacionReciboDto> ObtenerNominacionRecibos(int nominacion_id)
        {
            try
            {
                return Listar<NominacionRecibo, NominacionReciboDto>(x => x.Nominacion.Id == nominacion_id);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void GuardarNominacionRecibo(List<NominacionReciboDto> nominacionRecibo, int nominacion_id)
        {
            try
            {
                //Me traigo todos los nominacion recibo que tengo en la DB que corresponden a esa nominación.
                var nominacionRecibos = repositorio.Listar<NominacionRecibo>(x => x.Nominacion.Id == nominacion_id);

                //Recorro todos los recibos que tengo guardados en la base de datos que correspondan a esa nominación.
                foreach (var recibo in nominacionRecibos)
                {
                    //Me fijo si el recibo está en la lista que voy a guardar.
                    bool reciboBorrado = nominacionRecibo.FindAll(x => x.Id == recibo.Id).Count == 0;

                    //En caso de no estar, lo elimino de la base de datos.
                    if (reciboBorrado)
                    {
                        repositorio.Remover(recibo);
                    }
                }

                //Recorro todos los recibos a guardar
                foreach (var recibo in nominacionRecibo)
                {
                    //Me traigo el recibo de la DB.
                    NominacionRecibo nominacionReciboDB = repositorio.Obtener<NominacionRecibo>(x => x.Id == recibo.Id);

                    //En caso de que exista piso su data.
                    if (nominacionReciboDB != null)
                    {
                        nominacionReciboDB.Formato = recibo.Formato;
                        nominacionReciboDB.Exportador = repositorio.Obtener<Exportador>(x => x.Id == recibo.Exportador.Id);
                        nominacionReciboDB.RecibosPorDia = recibo.RecibosPorDia; 
                        nominacionReciboDB.MostrarDestinos = recibo.MostrarDestinos;
                        nominacionReciboDB.MostrarBodegas = recibo.MostrarBodegas;
                        nominacionReciboDB.Cantidad = recibo.Cantidad;
                        nominacionReciboDB.Ajuste = recibo.Ajuste;
                        nominacionReciboDB.DescripcionesBienes = recibo.DescripcionesBienes;
                        nominacionReciboDB.PuertoDeCarga = recibo.PuertoDeCarga;
                        nominacionReciboDB.PuertoDeDescarga = recibo.PuertoDeDescarga;
                        nominacionReciboDB.Unidad = recibo.Unidad;
                    }
                    //Si no existe lo agrego a la DB.
                    else
                    {
                        nominacionReciboDB = new NominacionRecibo()
                        {
                            Formato = recibo.Formato,
                            Exportador = repositorio.Obtener<Exportador>(x => x.Id == recibo.Exportador.Id),
                            DescripcionesBienes = recibo.DescripcionesBienes,
                            Unidad = recibo.Unidad,
                            PuertoDeDescarga = recibo.PuertoDeDescarga,
                            PuertoDeCarga = recibo.PuertoDeCarga,
                            Ajuste = recibo.Ajuste,
                            Cantidad = recibo.Cantidad,
                            MostrarBodegas = recibo.MostrarBodegas,
                            MostrarDestinos = recibo.MostrarDestinos,
                            RecibosPorDia = recibo.RecibosPorDia,
                            Nominacion = repositorio.Obtener<Nominacion>(x => x.Id == nominacion_id)
                        };
                        //Guardo toda la data en la DB.
                        repositorio.Agregar(nominacionReciboDB);
                    }
                }
                repositorio.GuardarCambios();
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