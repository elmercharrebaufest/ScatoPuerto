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
    public class ProcesadorGuardarDetalleLiquido : ProcesadorModificar<GuardarDetalleLiquidoPlanillaTurno>
    {
        public ProcesadorGuardarDetalleLiquido(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio = null) : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(GuardarDetalleLiquidoPlanillaTurno comando)
        {      
            var turno = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnos>(comando.IdTurno);

            if (turno == null)
                throw new Exception("Turno no encontrado");

            if (comando.Dto.Id > 0)
            {
                // ✏️ EDITAR
                var detalle = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>(comando.Dto.Id);

                detalle.Exportador = Repositorio.Obtener<Exportador>(comando.Dto.Exportador.Id);
                detalle.Linea_Id = comando.Dto.Linea_Id;
                detalle.BodegaParcel = comando.Dto.BodegaParcel;
                detalle.MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(comando.Dto.MaterialPuerto.Id);
                detalle.Destino = comando.Dto.Destino != null
                               ? Repositorio.Obtener<Destino>(comando.Dto.Destino.Id)
                               : null;
                detalle.Cantidad = comando.Dto.Cantidad;
                detalle.HoraInicio = comando.Dto.HoraInicio;
                detalle.HoraFin = comando.Dto.HoraFin;
                detalle.CambioMaterial = false;
                detalle.Observaciones = comando.Dto.Observaciones;

                Repositorio.Agregar(new LogABM
                {
                    Evento = EventoABM.Modificacion,
                    Pantalla = "Detalle Líquido",
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Entidad = comando.Dto.ToJson(),
                    ClaseId = comando.IdTurno
                });
            }
            else
            {
                // ➕ NUEVO
                var detalle = new ModuloDeCargaPlanillaDeTurnosDetallesLiquido
                {
                    ModuloDeCargaPlanillaDeTurnos = turno,
                    Exportador = Repositorio.Obtener<Exportador>(comando.Dto.Exportador.Id),
                    Linea_Id = comando.Dto.Linea_Id,
                    BodegaParcel = comando.Dto.BodegaParcel,
                    MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(comando.Dto.MaterialPuerto.Id),
                    Destino = comando.Dto.Destino != null
                                    ? Repositorio.Obtener<Destino>(comando.Dto.Destino.Id)
                                    : null,
                    Cantidad = comando.Dto.Cantidad,
                    HoraInicio = comando.Dto.HoraInicio,
                    HoraFin = comando.Dto.HoraFin,
                    CambioMaterial = false,
                    Observaciones = comando.Dto.Observaciones
                };

                Repositorio.Agregar(detalle);

                Repositorio.Agregar(new LogABM
                {
                    Evento = EventoABM.Alta,
                    Pantalla = "Detalle Líquido",
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Entidad = comando.Dto.ToJson(),
                    ClaseId = comando.IdTurno
                });
            }

            Repositorio.GuardarCambios();        
        }

        protected override void Validar(GuardarDetalleLiquidoPlanillaTurno comando, Resultado resultado)
        {            
        }
    }
}
