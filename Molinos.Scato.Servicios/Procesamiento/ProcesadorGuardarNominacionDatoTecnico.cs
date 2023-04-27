using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarNominacionDatoTecnico : ProcesadorComando<GuardarNominacionDatoTecnico>
    {
        public ProcesadorGuardarNominacionDatoTecnico(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }
        public override Resultado Ejecutar(GuardarNominacionDatoTecnico comando)
        {
            var resultado = new ResultadoCrear();

            try
            {

                if (comando.EsCreacion)
                {
                    var nominacionDatoTecnico = this.RegistrarDatoTecnico(comando);
                    var datoTecnico = comando.Dto.NominacionDatoTecnico;
                    Repositorio.Agregar(nominacionDatoTecnico);
                    Repositorio.GuardarCambios();
                    this.EliminarDetallesDatoTecnico(datoTecnico);
                    this.RegistrarDetallesDatoTecnico(nominacionDatoTecnico, datoTecnico);

                    Nominacion nominacion = Repositorio.Obtener<Nominacion>(x => x.Id == comando.Dto.Id);
                    nominacion.NominacionDatoTecnico = nominacionDatoTecnico;
                    Repositorio.GuardarCambios();
                }

                if (!comando.EsCreacion)
                {
                    var nominacionDatoTecnico = this.RegistrarDatoTecnico(comando);
                    var datoTecnico = comando.Dto.NominacionDatoTecnico;
                    this.ActualizarDetallesDatoTecnico(nominacionDatoTecnico, datoTecnico);
                    //this.EliminarDetallesDatoTecnico(datoTecnico);
                    //this.RegistrarDetallesDatoTecnico(nominacionDatoTecnico, datoTecnico);
                }
            }
            catch (Exception e)
            {
                resultado.Error("", Textos.Error_ActualizarGenerico);
                Log.Error("Error al crear dato tecnico {0}", e.StackTrace);
            }
            return resultado;
        }

        private NominacionDatoTecnico RegistrarDatoTecnico(GuardarNominacionDatoTecnico comando)
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
            if (!comando.EsCreacion)
                Repositorio.GuardarCambios();

            return nominacionDatoTecnico;
        }
        private void EliminarDetallesDatoTecnico(NominacionDatoTecnicoDto datoTecnico)
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
        private void RegistrarDetallesDatoTecnico(NominacionDatoTecnico nominacionDatoTecnico, NominacionDatoTecnicoDto datoTecnico)
        {

            if (datoTecnico.NominacionDatoTecnicoCalidad != null && datoTecnico.NominacionDatoTecnicoCalidad.Count > 0)
            {
                foreach (var calidad in datoTecnico.NominacionDatoTecnicoCalidad)
                {
                    var datoTecnicoCalidad = new NominacionDatoTecnicoCalidad();
                    datoTecnicoCalidad.NominacionDatoTecnico = nominacionDatoTecnico;
                    datoTecnicoCalidad.CalidadValor = Repositorio.Obtener<CalidadValor>(x => x.Id == calidad.CalidadValor.Id);
                    Repositorio.Agregar(datoTecnicoCalidad);
                    Repositorio.GuardarCambios();
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
                    Repositorio.GuardarCambios();
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
                    Repositorio.GuardarCambios();
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
                    Repositorio.GuardarCambios();
                }
            }

        }

        private void ActualizarDetallesDatoTecnico(NominacionDatoTecnico nominacionDatoTecnico, NominacionDatoTecnicoDto datoTecnico)
        {
            #region Armado de listados
            var calidades = Repositorio.Listar<NominacionDatoTecnicoCalidad>(x => x.NominacionDatoTecnico.Id == datoTecnico.Id);
            var calidadesInsertar = datoTecnico.NominacionDatoTecnicoCalidad.Where(x => x.Id == 0);
            var calidadesEliminar = calidades.Where(x => !datoTecnico.NominacionDatoTecnicoCalidad.Select(y => y.Id).Contains(x.Id));
            var calidadesActualizar = calidades.Where(x => datoTecnico.NominacionDatoTecnicoCalidad.Select(y => y.Id).Contains(x.Id));

            var coordinadores = Repositorio.Listar<NominacionDatoTecnicoCoordinadorPuerto>(x => x.NominacionDatoTecnico.Id == datoTecnico.Id);
            var coordinadoresInsertar = datoTecnico.NominacionDatoTecnicoCoordinadorPuerto.Where(x => x.Id == 0);
            var coordinadoresEliminar = coordinadores.Where(x => !datoTecnico.NominacionDatoTecnicoCoordinadorPuerto.Select(y => y.Id).Contains(x.Id));
            var coordinadoresActualizar = coordinadores.Where(x => datoTecnico.NominacionDatoTecnicoCoordinadorPuerto.Select(y => y.Id).Contains(x.Id));

            var destinos = Repositorio.Listar<NominacionDatoTecnicoDestino>(x => x.NominacionDatoTecnico.Id == datoTecnico.Id);
            var destinosInsertar = datoTecnico.NominacionDatoTecnicoDestino.Where(x => x.Id == 0);
            var destinosEliminar = destinos.Where(x => !datoTecnico.NominacionDatoTecnicoDestino.Select(y => y.Id).Contains(x.Id));
            var destinosActualizar = destinos.Where(x => datoTecnico.NominacionDatoTecnicoDestino.Select(y => y.Id).Contains(x.Id));

            var exportadores = Repositorio.Listar<NominacionDatoTecnicoExportador>(x => x.NominacionDatoTecnico.Id == datoTecnico.Id);
            var exportadoresInsertar = datoTecnico.NominacionDatoTecnicoExportador.Where(x => x.Id == 0);
            var exportadoresEliminar = exportadores.Where(x => !datoTecnico.NominacionDatoTecnicoExportador.Select(y => y.Id).Contains(x.Id));
            var exportadoresActualizar = exportadores.Where(x => datoTecnico.NominacionDatoTecnicoExportador.Select(y => y.Id).Contains(x.Id));
            #endregion

            #region Eliminacion
            foreach (var calidad in calidadesEliminar) Repositorio.Remover(calidad);
            foreach (var coordinador in coordinadoresEliminar) Repositorio.Remover(coordinador);
            foreach (var destino in destinosEliminar) Repositorio.Remover(destino);
            foreach (var exportador in exportadoresEliminar) Repositorio.Remover(exportador);
            Repositorio.GuardarCambios();
            #endregion

            #region Insercion
            foreach (var calidad in calidadesInsertar)
            {
                var datoTecnicoCalidad = new NominacionDatoTecnicoCalidad();
                datoTecnicoCalidad.NominacionDatoTecnico = nominacionDatoTecnico;
                datoTecnicoCalidad.CalidadValor = Repositorio.Obtener<CalidadValor>(x => x.Id == calidad.CalidadValor.Id);
                Repositorio.Agregar(datoTecnicoCalidad);
                Repositorio.GuardarCambios();
            }

            foreach (var coordinador in coordinadoresInsertar)
            {
                var datoTecnicoCoordinadorPuerto = new NominacionDatoTecnicoCoordinadorPuerto();
                datoTecnicoCoordinadorPuerto.NominacionDatoTecnico = nominacionDatoTecnico;
                datoTecnicoCoordinadorPuerto.CoordinadorPuerto = Repositorio.Obtener<CoordinadorPuerto>(x => x.Id == coordinador.CoordinadorPuerto.Id);
                datoTecnicoCoordinadorPuerto.Cantidad = coordinador.Cantidad;
                Repositorio.Agregar(datoTecnicoCoordinadorPuerto);
                Repositorio.GuardarCambios();
            }

            foreach (var destino in destinosInsertar)
            {
                var datoTecnicoDestino = new NominacionDatoTecnicoDestino();
                datoTecnicoDestino.NominacionDatoTecnico = nominacionDatoTecnico;
                datoTecnicoDestino.Destino = Repositorio.Obtener<Destino>(x => x.Id == destino.Destino.Id);
                datoTecnicoDestino.Cantidad = destino.Cantidad;
                Repositorio.Agregar(datoTecnicoDestino);
                Repositorio.GuardarCambios();
            }

            foreach (var exportador in exportadoresInsertar)
            {
                var datoTecnicoExportador = new NominacionDatoTecnicoExportador();
                datoTecnicoExportador.NominacionDatoTecnico = nominacionDatoTecnico;
                datoTecnicoExportador.Exportador = Repositorio.Obtener<Exportador>(x => x.Id == exportador.Exportador.Id);
                datoTecnicoExportador.Cantidad = exportador.Cantidad;
                datoTecnicoExportador.Tolerancia = exportador.Tolerancia;
                Repositorio.Agregar(datoTecnicoExportador);
                Repositorio.GuardarCambios();
            }
            #endregion

            #region Actualizacion
            foreach (var calidad in calidadesActualizar)
            {
                var dto = datoTecnico.NominacionDatoTecnicoCalidad.FirstOrDefault(x => x.Id == calidad.Id);
                calidad.NominacionDatoTecnico = nominacionDatoTecnico;
                calidad.CalidadValor = Repositorio.Obtener<CalidadValor>(x => x.Id == dto.CalidadValor.Id);
                Repositorio.GuardarCambios();
            }

            foreach (var coordinador in coordinadoresActualizar)
            {
                var dto = datoTecnico.NominacionDatoTecnicoCoordinadorPuerto.FirstOrDefault(x => x.Id == coordinador.Id);
                coordinador.NominacionDatoTecnico = nominacionDatoTecnico;
                coordinador.CoordinadorPuerto = Repositorio.Obtener<CoordinadorPuerto>(x => x.Id == dto.CoordinadorPuerto.Id);
                coordinador.Cantidad = dto.Cantidad;
                Repositorio.GuardarCambios();
            }

            foreach (var destino in destinosActualizar)
            {
                var dto = datoTecnico.NominacionDatoTecnicoDestino.FirstOrDefault(x => x.Id == destino.Id);
                destino.NominacionDatoTecnico = nominacionDatoTecnico;
                destino.Destino = Repositorio.Obtener<Destino>(x => x.Id == dto.Destino.Id);
                destino.Cantidad = dto.Cantidad;
                Repositorio.GuardarCambios();
            }

            foreach (var exportador in exportadoresActualizar)
            {
                var dto = datoTecnico.NominacionDatoTecnicoExportador.FirstOrDefault(x => x.Id == exportador.Id);
                exportador.NominacionDatoTecnico = nominacionDatoTecnico;
                exportador.Exportador = Repositorio.Obtener<Exportador>(x => x.Id == dto.Exportador.Id);
                exportador.Cantidad = dto.Cantidad;
                exportador.Tolerancia = dto.Tolerancia;
                Repositorio.GuardarCambios();
            }

            #endregion
        }
    }
}
