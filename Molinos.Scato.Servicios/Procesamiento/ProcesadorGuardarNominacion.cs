using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarNominacion : ProcesadorModificar<GuardarNominacion>
    {
        public ProcesadorGuardarNominacion(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio)
            : base(repositorio, conversor, log, servicioRepositorio)
        {
        }
        protected override void ModificarEntidad(GuardarNominacion comando)
        {
            if (comando.EsCreacion)
            {

                var nominacionDatoTecnico = new NominacionDatoTecnico();
                var datoTecnico = comando.Dto.NominacionDatoTecnico;

                MuelleDeCarga muelleDeCarga = null;
                TasaDeCarga tasaDeCarga = null;
                TipoDeContrato tipoDeContrato = null;
                ATAPuerto ataPuerto = null;
                AgenciaMaritimaPuerto agenciaMaritimaPuerto = null;
                Surveyor surveyor = null;
                Vapor vapor = null;
                MaterialPuerto materialPuerto = null;

                muelleDeCarga = datoTecnico.MuelleDeCarga != null ? Repositorio.Obtener<MuelleDeCarga>(x => x.Id == datoTecnico.MuelleDeCarga.Id) : muelleDeCarga;
                tasaDeCarga = datoTecnico.TasaDeCarga != null ? Repositorio.Obtener<TasaDeCarga>(x => x.Id == datoTecnico.TasaDeCarga.Id) : tasaDeCarga;
                tipoDeContrato = datoTecnico.TipoDeContrato != null ? Repositorio.Obtener<TipoDeContrato>(x => x.Id == datoTecnico.TipoDeContrato.Id) : tipoDeContrato;
                ataPuerto = datoTecnico.ATAPuerto != null ? Repositorio.Obtener<ATAPuerto>(x => x.Id == datoTecnico.ATAPuerto.Id) : ataPuerto;
                agenciaMaritimaPuerto = datoTecnico.AgenciaMaritimaPuerto != null ? Repositorio.Obtener<AgenciaMaritimaPuerto>(x => x.Id == datoTecnico.AgenciaMaritimaPuerto.Id) : agenciaMaritimaPuerto;
                surveyor = datoTecnico.Surveyor != null ? Repositorio.Obtener<Surveyor>(x => x.Id == datoTecnico.Surveyor.Id) : surveyor;
                vapor = datoTecnico.Vapor != null ? Repositorio.Obtener<Vapor>(x => x.Id == datoTecnico.Vapor.Id) : vapor;
                materialPuerto = datoTecnico.MaterialPuerto != null ? Repositorio.Obtener<MaterialPuerto>(x => x.Id == datoTecnico.MaterialPuerto.Id) : materialPuerto;

                nominacionDatoTecnico.MaterialPuerto = materialPuerto;
                nominacionDatoTecnico.CantidadTotal = datoTecnico.CantidadTotal;
                nominacionDatoTecnico.Tolerancia = datoTecnico.Tolerancia;
                nominacionDatoTecnico.Observaciones = datoTecnico.Observaciones;
                nominacionDatoTecnico.Vapor = vapor;
                nominacionDatoTecnico.ETARecalada = datoTecnico.ETARecalada;
                nominacionDatoTecnico.ObligacionDeCarga = datoTecnico.ObligacionDeCarga;
                nominacionDatoTecnico.MuelleDeCarga = muelleDeCarga;
                nominacionDatoTecnico.TasaDeCarga = tasaDeCarga;
                nominacionDatoTecnico.TasaDeCargaValor = datoTecnico.TasaDeCargaValor;
                nominacionDatoTecnico.DEM = datoTecnico.DEM;
                nominacionDatoTecnico.DES = datoTecnico.DES;
                nominacionDatoTecnico.TipoDeContrato = tipoDeContrato;
                nominacionDatoTecnico.ATAPuerto = ataPuerto;
                nominacionDatoTecnico.AgenciaMaritimaPuerto = agenciaMaritimaPuerto;
                nominacionDatoTecnico.Surveyor = surveyor;
                nominacionDatoTecnico.ObservacionesSurveyor = datoTecnico.ObservacionesSurveyor;
                Repositorio.Agregar(nominacionDatoTecnico);
                Repositorio.GuardarCambios();

                if (datoTecnico.NominacionDatoTecnicoCalidad != null && datoTecnico.NominacionDatoTecnicoCalidad.Count > 0)
                {
                    foreach (var calidad in datoTecnico.NominacionDatoTecnicoCalidad)
                    {
                        var datoTecnicoCalidad = new NominacionDatoTecnicoCalidad();
                        datoTecnicoCalidad.NominacionDatoTecnico = nominacionDatoTecnico;
                        datoTecnicoCalidad.CalidadValor = Repositorio.Obtener<CalidadValor>(x => x.Id == calidad.CalidadValor.Id);
                        Repositorio.Agregar(datoTecnicoCalidad);
                    }
                }

                if (datoTecnico.NominacionDatoTecnicoCoordinadorPuerto != null && datoTecnico.NominacionDatoTecnicoCoordinadorPuerto.Count > 0)
                {
                    foreach (var coordinador in datoTecnico.NominacionDatoTecnicoCoordinadorPuerto)
                    {
                        var datoTecnicoCoordinadorPuerto = new NominacionDatoTecnicoCoordinadorPuerto();
                        datoTecnicoCoordinadorPuerto.NominacionDatoTecnico = nominacionDatoTecnico;
                        datoTecnicoCoordinadorPuerto.CoordinadorPuerto = Repositorio.Obtener<CoordinadorPuerto>(x => x.Id == coordinador.CoordinadorPuerto.Id);
                        datoTecnicoCoordinadorPuerto.Cantidad = coordinador.Cantidad;
                        Repositorio.Agregar(datoTecnicoCoordinadorPuerto);
                    }
                }

                if (datoTecnico.NominacionDatoTecnicoDestino != null && datoTecnico.NominacionDatoTecnicoDestino.Count > 0)
                {
                    foreach (var destino in datoTecnico.NominacionDatoTecnicoDestino)
                    {
                        var datoTecnicoDestino = new NominacionDatoTecnicoDestino();
                        datoTecnicoDestino.NominacionDatoTecnico = nominacionDatoTecnico;
                        datoTecnicoDestino.Destino = Repositorio.Obtener<Destino>(x => x.Id == destino.Destino.Id);
                        datoTecnicoDestino.Cantidad = destino.Cantidad;
                        Repositorio.Agregar(datoTecnicoDestino);
                    }
                }

                if (datoTecnico.NominacionDatoTecnicoDestino != null && datoTecnico.NominacionDatoTecnicoExportador.Count > 0)
                {
                    foreach (var exportador in datoTecnico.NominacionDatoTecnicoExportador)
                    {
                        var datoTecnicoExportador = new NominacionDatoTecnicoExportador();
                        datoTecnicoExportador.NominacionDatoTecnico = nominacionDatoTecnico;
                        datoTecnicoExportador.Exportador = Repositorio.Obtener<Exportador>(x => x.Id == exportador.Exportador.Id);
                        datoTecnicoExportador.Cantidad = exportador.Cantidad;
                        datoTecnicoExportador.Tolerancia = exportador.Tolerancia;
                        Repositorio.Agregar(datoTecnicoExportador);
                    }
                }

                var nominacion = new Nominacion();
                nominacion.FechaCreacion = DateTime.Now;
                nominacion.EnviadoFumigador = false;
                nominacion.EnviadoSurveyor = false;
                nominacion.EnviadoOtros = false;
                nominacion.NominacionDatoTecnico = nominacionDatoTecnico;
                nominacion.NominacionDetalleIntervencion = null;
                nominacion.NominacionRecibo = null;
                nominacion.Embarque = null;
                Repositorio.Agregar(nominacion);
                Repositorio.GuardarCambios();
            }
            /*
            if (!comando.esCreacion)
            {
                if (comando.esModificacionDatoTecnico)
                {
                }
                if (comando.esModificacionIntervenciones)
                {
                }
                if (comando.esModificacionRecibos)
                {
                }
            }
            */


        }

        protected override void Validar(GuardarNominacion comando, Resultado resultado)
        {
        }
    }
}
