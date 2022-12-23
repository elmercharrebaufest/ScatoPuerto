using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarNominacionDatoTecnico : ProcesadorModificar<GuardarNominacionDatoTecnico>
    {
        public ProcesadorGuardarNominacionDatoTecnico(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio)
            : base(repositorio, conversor, log, servicioRepositorio)
        {
        }
        protected override void ModificarEntidad(GuardarNominacionDatoTecnico comando)
        {
            if (comando.EsCreacion)
            {
                var nominacionDatoTecnico = this.AsignarDatoTecnico(comando);
                var datoTecnico = comando.Dto.NominacionDatoTecnico;
                Repositorio.Agregar(nominacionDatoTecnico);
                Repositorio.GuardarCambios();

                this.AsignarDatoTecnicoDetalles(nominacionDatoTecnico, datoTecnico, comando.EsCreacion);

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
            
            if (!comando.EsCreacion)
            {
                var nominacionDatoTecnico = this.AsignarDatoTecnico(comando);
                var datoTecnico = comando.Dto.NominacionDatoTecnico;
                Repositorio.GuardarCambios();

                this.AsignarDatoTecnicoDetalles(nominacionDatoTecnico, datoTecnico, comando.EsCreacion);
            }
        }

        protected override void Validar(GuardarNominacionDatoTecnico comando, Resultado resultado)
        {
        }
        private NominacionDatoTecnico AsignarDatoTecnico(GuardarNominacionDatoTecnico comando)
        {
            var nominacionDatoTecnico = new NominacionDatoTecnico();
            var datoTecnico = comando.Dto.NominacionDatoTecnico;

            if (comando.EsCreacion)
                nominacionDatoTecnico = new NominacionDatoTecnico();

            if (!comando.EsCreacion)
                nominacionDatoTecnico = Repositorio.Obtener<NominacionDatoTecnico>(x => x.Id == comando.Dto.NominacionDatoTecnico.Id);

            MuelleDeCarga muelleDeCarga = null;
            TasaDeCarga tasaDeCarga = null;
            TipoDeContrato tipoDeContrato = null;
            ATAPuerto ataPuerto = null;
            AgenciaMaritimaPuerto agenciaMaritimaPuerto = null;
            Surveyor surveyor = null;
            VaporInformacion vaporInformacion = null;
            MaterialPuerto materialPuerto = null;

            muelleDeCarga = datoTecnico.MuelleDeCarga != null ? Repositorio.Obtener<MuelleDeCarga>(x => x.Id == datoTecnico.MuelleDeCarga.Id) : muelleDeCarga;
            tasaDeCarga = datoTecnico.TasaDeCarga != null ? Repositorio.Obtener<TasaDeCarga>(x => x.Id == datoTecnico.TasaDeCarga.Id) : tasaDeCarga;
            tipoDeContrato = datoTecnico.TipoDeContrato != null ? Repositorio.Obtener<TipoDeContrato>(x => x.Id == datoTecnico.TipoDeContrato.Id) : tipoDeContrato;
            ataPuerto = datoTecnico.ATAPuerto != null ? Repositorio.Obtener<ATAPuerto>(x => x.Id == datoTecnico.ATAPuerto.Id) : ataPuerto;
            agenciaMaritimaPuerto = datoTecnico.AgenciaMaritimaPuerto != null ? Repositorio.Obtener<AgenciaMaritimaPuerto>(x => x.Id == datoTecnico.AgenciaMaritimaPuerto.Id) : agenciaMaritimaPuerto;
            surveyor = datoTecnico.Surveyor != null ? Repositorio.Obtener<Surveyor>(x => x.Id == datoTecnico.Surveyor.Id) : surveyor;
            vaporInformacion = datoTecnico.VaporInformacion != null ? Repositorio.Obtener<VaporInformacion>(x => x.Id == datoTecnico.VaporInformacion.Id) : vaporInformacion;
            materialPuerto = datoTecnico.MaterialPuerto != null ? Repositorio.Obtener<MaterialPuerto>(x => x.Id == datoTecnico.MaterialPuerto.Id) : materialPuerto;

            nominacionDatoTecnico.MaterialPuerto = materialPuerto;
            nominacionDatoTecnico.CantidadTotal = datoTecnico.CantidadTotal;
            nominacionDatoTecnico.Tolerancia = datoTecnico.Tolerancia;
            nominacionDatoTecnico.Observaciones = datoTecnico.Observaciones;
            nominacionDatoTecnico.VaporInformacion = vaporInformacion;
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

            return nominacionDatoTecnico;
        }
        private void AsignarDatoTecnicoDetalles(NominacionDatoTecnico nominacionDatoTecnico, NominacionDatoTecnicoDto datoTecnico, bool esCreacion)
        {
            if (!esCreacion)
            {
                var calidades = Repositorio.Listar<NominacionDatoTecnicoCalidad>(x => x.NominacionDatoTecnico.Id == datoTecnico.Id);
                var coordinadores = Repositorio.Listar<NominacionDatoTecnicoCoordinadorPuerto>(x => x.NominacionDatoTecnico.Id == datoTecnico.Id);
                var destinos = Repositorio.Listar<NominacionDatoTecnicoDestino>(x => x.NominacionDatoTecnico.Id == datoTecnico.Id);
                var exportadores = Repositorio.Listar<NominacionDatoTecnicoExportador>(x => x.NominacionDatoTecnico.Id == datoTecnico.Id);

                foreach (var calidad in calidades) Repositorio.Remover<NominacionDatoTecnicoCalidad>(calidad);
                foreach (var coordinador in coordinadores) Repositorio.Remover<NominacionDatoTecnicoCoordinadorPuerto>(coordinador);
                foreach (var destino in destinos) Repositorio.Remover<NominacionDatoTecnicoDestino>(destino);
                foreach (var exportador in exportadores) Repositorio.Remover<NominacionDatoTecnicoExportador>(exportador);
                Repositorio.GuardarCambios();
            }
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

        }
    }
}
