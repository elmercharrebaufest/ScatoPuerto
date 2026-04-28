using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarOtrosMuellesCargaDetalle : ProcesadorComando<GuardarOtrosMuellesCargaDetalle>
    {
        public ProcesadorGuardarOtrosMuellesCargaDetalle(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log)
        {
        }
        public override Resultado Ejecutar(GuardarOtrosMuellesCargaDetalle comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var esCreacion = false;
                var embarqueDb = Repositorio.Obtener<Embarque>(comando.EmbarqueId) ?? throw new Exception("No se encontró el embarque con ID " + comando.EmbarqueId);
                var cargaDb = embarqueDb.OtroMuelleCarga;

                if (cargaDb == null)
                {
                    cargaDb = new OtroMuelleCarga
                    {
                        Observacion = string.Empty,
                        OtroMuelleCargaDetalles = new List<OtroMuelleCargaDetalle>()
                    };
                    embarqueDb.OtroMuelleCarga = cargaDb;
                }

                var cargaDetalleDb = cargaDb.OtroMuelleCargaDetalles.FirstOrDefault(x => x.Id == comando.Dto.Id);
                if (cargaDetalleDb == null)
                {
                    cargaDetalleDb = new OtroMuelleCargaDetalle();
                    cargaDb.OtroMuelleCargaDetalles.Add(cargaDetalleDb);
                    esCreacion = true;
                }

                Log.Info($"El usuario {comando.Usuario} va a {(esCreacion ? "crear" : "modificar")} un detalle de carga del muelle {embarqueDb.OtroMuelleNombre} para embarque {comando.EmbarqueId}");

                cargaDetalleDb.FechaHoraInicio = comando.Dto.FechaHoraInicio;
                cargaDetalleDb.FechaHoraFin = comando.Dto.FechaHoraFin;
                cargaDetalleDb.Exportador = Repositorio.Obtener<Exportador>(comando.Dto.Exportador.Id);
                cargaDetalleDb.Destino = Repositorio.Obtener<Destino>(comando.Dto.Destino.Id);
                cargaDetalleDb.MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(comando.Dto.MaterialPuerto.Id);
                cargaDetalleDb.TipoMaterial = comando.Dto.TipoMaterial ?? string.Empty;
                cargaDetalleDb.CantidadTn = comando.Dto.CantidadTn;

                var log = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = esCreacion ? EventoABM.Alta : EventoABM.Modificacion,
                    Entidad = comando.Dto.ToJson(),
                    ClaseId = embarqueDb.Id
                };

                Repositorio.GuardarCambios();
                Log.Info($"El usuario {comando.Usuario} guardó el detalle de carga {cargaDetalleDb.Id} del muelle {embarqueDb.OtroMuelleNombre} para embarque {comando.EmbarqueId}");
            }
            catch (Exception e)
            {
                resultado.Errores.Add("", e.Message);
                Log.Error(e, "Error al guardar detalle carga otros muelles", e);
            }
            return resultado;
        }
    }
}
