using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarDetalleSolido : ProcesadorModificar<GuardarDetalleSolidoPlanillaTurno>
    {
        public ProcesadorGuardarDetalleSolido(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio = null) : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(GuardarDetalleSolidoPlanillaTurno comando)
        {
            var turno = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnos>(comando.IdTurno);

            if (turno == null)
                throw new Exception("Turno no encontrado");

            if (comando.Dto.Id > 0)
            {
                // ✏️ EDITAR
                var detalle = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(comando.Dto.Id);

                detalle.Exportador = Repositorio.Obtener<Exportador>(comando.Dto.Exportador.Id);
                detalle.SiloCelda = Repositorio.Obtener<SiloCelda>(comando.Dto.SiloCelda.Id);
                detalle.MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(comando.Dto.MaterialPuerto.Id);
                detalle.Destino = Repositorio.Obtener<Destino>(comando.Dto.Destino.Id);
                detalle.Bodega = Repositorio.Obtener<Bodega>(comando.Dto.Bodega.Id);
                detalle.Cantidad = comando.Dto.Cantidad;
                detalle.HoraInicio = comando.Dto.HoraInicio;
                detalle.HoraFin = comando.Dto.HoraFin;
                detalle.Observaciones = comando.Dto.Observaciones;

                Repositorio.Agregar(new LogABM
                {
                    Evento = EventoABM.Modificacion,
                    Pantalla = "Detalle Solido",
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Entidad = comando.Dto.ToJson(),
                    ClaseId = comando.IdTurno
                });
            }
            else
            {
                // ➕ NUEVO
                var detalle = new ModuloDeCargaPlanillaDeTurnosDetallesSolido
                {
                    ModuloDeCargaPlanillaDeTurnos = turno,
                    Exportador = Repositorio.Obtener<Exportador>(comando.Dto.Exportador.Id),
                    SiloCelda = Repositorio.Obtener<SiloCelda>(comando.Dto.SiloCelda.Id),
                    MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(comando.Dto.MaterialPuerto.Id),
                    Destino = Repositorio.Obtener<Destino>(comando.Dto.Destino.Id),
                    Bodega = Repositorio.Obtener<Bodega>(comando.Dto.Bodega.Id),
                    Cantidad = comando.Dto.Cantidad,
                    HoraInicio = comando.Dto.HoraInicio,
                    HoraFin = comando.Dto.HoraFin,
                    Observaciones = comando.Dto.Observaciones
                };

                Repositorio.Agregar(detalle);

                Repositorio.Agregar(new LogABM
                {
                    Evento = EventoABM.Alta,
                    Pantalla = "Detalle Solido",
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Entidad = comando.Dto.ToJson(),
                    ClaseId = comando.IdTurno
                });
            }

            Repositorio.GuardarCambios();
        }

        protected override void Validar(GuardarDetalleSolidoPlanillaTurno comando, Resultado resultado)
        {            
        }
    }
}
