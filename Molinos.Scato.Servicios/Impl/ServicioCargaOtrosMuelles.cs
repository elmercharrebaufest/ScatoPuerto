using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Linq;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioCargaOtrosMuelles : IServicioCargaOtrosMuelles
    {
        private readonly IRepositorio _repositorio;
        private readonly IConversor _conversor;
        private readonly ILogger _log;
        private readonly IServicioComandos _servicioComandos;

        public ServicioCargaOtrosMuelles(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioComandos servicioComandos)
        {
            _repositorio = repositorio;
            _conversor = conversor;
            _log = log;
            _servicioComandos = servicioComandos;
        }

        public OtroMuelleCargaDto ObtenerCarga(int embarqueId)
        {
            var embarque = _repositorio.Obtener<Embarque>(e => e.Id == embarqueId) ?? throw new Exception($"No se encontró el embarque con ID {embarqueId}");
            var otroMuelleCarga = embarque.OtroMuelleCarga ?? new OtroMuelleCarga();
            return _conversor.Convertir<OtroMuelleCarga, OtroMuelleCargaDto>(otroMuelleCarga);
        }

        public OtroMuelleNominacionDto ObtenerDatosNominacion(int embarqueId)
        {
            var nominaciones = _conversor.ConvertirList<Nominacion, NominacionDto>(_repositorio.Listar<Nominacion>(n => n.Embarque.Id == embarqueId).ToList());
            var materiales = nominaciones.Select(n => n.NominacionDatoTecnico.MaterialPuerto).Distinct().ToList();
            var destinos = nominaciones.SelectMany(n => n.NominacionDatoTecnico.NominacionDatoTecnicoDestino.Select(d => d.Destino)).Distinct().ToList();
            var exportadores = nominaciones.SelectMany(n => n.NominacionDatoTecnico.NominacionDatoTecnicoExportador.Select(e => e.Exportador)).Distinct().ToList();
            var tieneFumigacion = nominaciones.Any(n => n.NominacionDetalleIntervencion.Fumigacion == "Si");
            var tieneSenasa = nominaciones.SelectMany(n => n.NominacionDetalleIntervencion.Senasa).Any(s => s.TieneSenasa);

            return new OtroMuelleNominacionDto
            {
                TieneFumigacion = tieneFumigacion,
                TieneSenasa = tieneSenasa,
                Materiales = materiales,
                Destinos = destinos,
                Exportadores = exportadores
            };
        }

        public void GuardarCarga(OtroMuelleCargaDto otroMuelleCarga, int embarqueId, bool zarpar, string usuario)
        {
            var esCreacion = false;
            var embarque = _repositorio.Obtener<Embarque>(embarqueId) ?? throw new Exception($"No se encontró el embarque con ID {embarqueId}");
            _log.Info($"El usuario {usuario} ha solicitado {(zarpar ? "zarpar el embarque" : "guardar la carga del embarque")} {embarque.Patente} + {embarque.OtroMuelleNombre}. ID: {embarqueId}");

            var otroMuelleCargaDb = embarque.OtroMuelleCarga;
            if (otroMuelleCargaDb == null)
            {
                otroMuelleCargaDb = new OtroMuelleCarga();
                embarque.OtroMuelleCarga = otroMuelleCargaDb;
                esCreacion = true;
            }

            otroMuelleCargaDb.Observacion = otroMuelleCarga.Observacion ?? "";
            otroMuelleCargaDb.FumigacionPreventiva = otroMuelleCarga.FumigacionPreventiva;
            otroMuelleCargaDb.FumigacionCurativa = otroMuelleCarga.FumigacionCurativa;
            otroMuelleCargaDb.Senasa = otroMuelleCarga.Senasa;

            var logAbm = new LogABM
            {
                Pantalla = "GuardarOtrosMuellesCarga",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = esCreacion ? EventoABM.Alta : EventoABM.Modificacion,
                Entidad = otroMuelleCarga.ToJson(),
                ClaseId = embarque.Id
            };
            _repositorio.Agregar(logAbm);

            if (zarpar)
            {
                var ubicacionZarpado = _repositorio.Obtener<UbicacionDeBuquePuerto>(u => u.Orden == 1);
                embarque.Ubicacion = ubicacionZarpado.Id;

                var lineup = _repositorio.Obtener<LineUp>(l => l.Embarque.Id == embarqueId);
                lineup.ModuloDeCarga.FechaZarpado = DateTime.Now;

                var logAbm2 = new LogABM
                {
                    Pantalla = "ZarparEmbarque",
                    Usuario = usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = $"El embarque {embarque.OtroMuelleNombre} - {embarque.Patente} ha zarpado",
                    ClaseId = embarque.Id
                };
                _repositorio.Agregar(logAbm2);
            }

            _repositorio.GuardarCambios();
            _log.Info($"El usuario {usuario} ha {(zarpar ? "zarpado el embarque" : "guardado la carga del embarque")} {embarque.Patente} + {embarque.OtroMuelleNombre} correctamente. ID: {embarqueId}");
        }

        public void GuardarDetalleCarga(OtroMuelleCargaDetalleDto otroMuelleCargaDetalle, int embarqueId, string usuario)
        {
            var res = _servicioComandos.Ejecutar(new GuardarOtrosMuellesCargaDetalle { Dto = otroMuelleCargaDetalle, EmbarqueId = embarqueId, Usuario = usuario });
            if (res.HayErrores)
            {
                throw new Exception(res.Errores[""]);
            }
        }

        public void EliminarDetalleCarga(int otroMuelleCargaDetalleId, string usuario)
        {
            var detalle = _repositorio.Obtener<OtroMuelleCargaDetalle>(d => d.Id == otroMuelleCargaDetalleId) ?? throw new Exception("El detalle de carga para otros muelles a eliminar no existe");
            var embarque = _repositorio.Obtener<Embarque>(e => e.OtroMuelleCarga.Id == detalle.OtroMuelleCarga.Id) ?? throw new Exception("No se encontró el embarque correspondiente al detalle de carga");

            _log.Info($"El usuario {usuario} ha solicitado eliminar el detalle de carga para muelle {embarque.OtroMuelleNombre} con ID {otroMuelleCargaDetalleId}");

            var logAbm = new LogABM
            {
                Pantalla = "EliminarOtrosMuellesCargaDetalle",
                Usuario = usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Baja,
                Entidad = $"Detalle de carga para muelle {embarque.OtroMuelleNombre} con ID {otroMuelleCargaDetalleId} perteneciente al embarque con ID {embarque.Id} se ha eliminado correctamente",
                ClaseId = embarque.Id
            };
            _repositorio.Agregar(logAbm);

            _repositorio.Remover(detalle);

            _repositorio.GuardarCambios();

            _log.Info($"El usuario {usuario} ha eliminado el detalle de otro muelle con ID {otroMuelleCargaDetalleId} correctamente");
        }

        public bool ValidarHorarios(OtroMuelleCargaDetalleDto detalle, int embarqueId)
        {
            var detalles = _repositorio.Obtener<Embarque>(embarqueId).OtroMuelleCarga?.OtroMuelleCargaDetalles;
            if (detalles == null || detalles.Count == 0)
            {
                return true;
            }
            var seSuperpone = detalles.Any(d =>
                d.Id != detalle.Id &&
                d.FechaHoraInicio < detalle.FechaHoraFin &&
                d.FechaHoraFin > detalle.FechaHoraInicio
            );
            return !seSuperpone;
        }

        public string ObtenerDestinatarios()
        {
            var confMail = _repositorio.Obtener<ConfiguracionMail>(c => c.TemplateMail == "EmbarqueZarpoOtrosMuelles") ?? throw new Exception("No se encontró la configuración de mail para template EmbarqueZarpoOtrosMuelles");
            return confMail.Direcciones;
        }

        public EmbarqueDto ObtenerEmbarque(int embarqueId)
        {
            var embarque = _repositorio.Obtener<Embarque>(embarqueId) ?? throw new Exception($"No se encontró el embarque con ID {embarqueId}");
            return _conversor.Convertir<Embarque, EmbarqueDto>(embarque);
        }
    }
}
