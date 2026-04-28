using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.ListView;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarDetalleSolido : ProcesadorModificar<GuardarDetalleSolidoPlanillaTurno>
    {
        public ProcesadorGuardarDetalleSolido(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio = null) : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        /*protected override void ModificarEntidad(GuardarDetalleSolidoPlanillaTurno comando)
        {
            int bodegaAnteriorId = 0;
            int materialAnteriorId = 0;
            var turno = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnos>(comando.IdTurno);

            if (turno == null)
                throw new Exception("Turno no encontrado");

            if (comando.Dto.Id > 0)
            {
                // ✏️ EDITAR
                var detalle = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(comando.Dto.Id);

                bodegaAnteriorId = detalle.Bodega.Id;
                materialAnteriorId = detalle.MaterialPuerto.Id;

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

            // ==============================
            // GUARDADO A PLANODECARGABODEGA
            // ==============================

            var lineup = Repositorio.Obtener<LineUp>(l => l.ModuloDeCarga.Id == turno.ModuloDeCarga.Id);

            var plano = lineup?.PlanoDeCarga;

            if (plano == null)
                throw new Exception("No existe plano de carga");

            var bodega = Repositorio.Obtener<Bodega>(comando.Dto.Bodega.Id);
            // obtener número de bodega
            var nroBodega = int.Parse(bodega.Nombre.Replace("BODEGA", "").Trim());

            // buscar si ya existe
            var planoBodega = Repositorio.Obtener<PlanoDeCargaBodega>(p =>
                p.PlanoDeCarga.Id == plano.Id &&
                p.BodegaParcel == nroBodega
            );

            // validar producto distinto
            if (planoBodega != null && planoBodega.MaterialPuerto.Id != comando.Dto.MaterialPuerto.Id)
            {
                throw new Exception(
                    $"Existen cargas de otro producto en la bodega {nroBodega}, verifique"
                );
            }

            // crear si no existe
            if (planoBodega == null)
            {
                planoBodega = new PlanoDeCargaBodega
                {
                    PlanoDeCarga = plano,
                    BodegaParcel = nroBodega,
                    MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(comando.Dto.MaterialPuerto.Id),
                    FumPreventiva = false,
                    FumCurativa = false
                };

                Repositorio.Agregar(planoBodega);
            }
            else
            {
                // actualizar producto si corresponde
                var cambioBodega = bodegaAnteriorId != comando.Dto.Bodega.Id;
                var cambioMaterial = materialAnteriorId != comando.Dto.MaterialPuerto.Id;
                if (cambioBodega && cambioMaterial)
                {
                    planoBodega.MaterialPuerto =
                    Repositorio.Obtener<MaterialPuerto>(comando.Dto.MaterialPuerto.Id);
                }                    
            }


            Repositorio.GuardarCambios();
        }*/

        protected override void ModificarEntidad(GuardarDetalleSolidoPlanillaTurno comando)
        {
            int bodegaAnteriorId = 0;
            int materialAnteriorId = 0;

            var turno = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnos>(comando.IdTurno);
            if (turno == null)
                throw new Exception("Turno no encontrado");

            // ==============================
            // ALTA / EDICIÓN DETALLE
            // ==============================

            if (comando.Dto.Id > 0)
            {
                //EDITAR
                var detalle = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(comando.Dto.Id);

                bodegaAnteriorId = detalle.Bodega.Id;
                materialAnteriorId = detalle.MaterialPuerto.Id;

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
                //NUEVO
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

            // ==============================
            // PLANO DE CARGA
            // ==============================

            var lineup = Repositorio.Obtener<LineUp>(l => l.ModuloDeCarga.Id == turno.ModuloDeCarga.Id);
            var plano = lineup?.PlanoDeCarga;

            if (plano == null)
                throw new Exception("No existe plano de carga");

            var bodegaDestino = Repositorio.Obtener<Bodega>(comando.Dto.Bodega.Id);
            var nroBodegaDestino = int.Parse(bodegaDestino.Nombre.Replace("BODEGA", "").Trim());

            var materialDestino = Repositorio.Obtener<MaterialPuerto>(comando.Dto.MaterialPuerto.Id);

            // ==============================
            // VALIDAR BODEGA DESTINO
            // ==============================

            var planoDestino = Repositorio.Obtener<PlanoDeCargaBodega>(p =>
                p.PlanoDeCarga.Id == plano.Id &&
                p.BodegaParcel == nroBodegaDestino
            );

            var existeOtraCargaConOtroProducto =
            Repositorio.Existe<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(d =>
            d.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id == turno.ModuloDeCarga.Id &&
            d.Bodega.Id == comando.Dto.Bodega.Id &&
            d.Id != comando.Dto.Id &&
            d.MaterialPuerto.Id != materialDestino.Id);

            if (existeOtraCargaConOtroProducto)
            {
                throw new Exception(
                    $"La bodega {nroBodegaDestino} ya posee cargas de otro producto"
                );
            }


            // ==============================
            // LIMPIAR BODEGA ANTERIOR
            // ==============================

            if (bodegaAnteriorId > 0 && bodegaAnteriorId != comando.Dto.Bodega.Id)
            {
                var tieneMasCargas = Repositorio.Existe<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(d =>
                    d.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id == turno.ModuloDeCarga.Id &&
                    d.Bodega.Id == bodegaAnteriorId &&
                    d.Id != comando.Dto.Id
                );

                if (!tieneMasCargas)
                {
                    var bodegaAnterior = Repositorio.Obtener<Bodega>(bodegaAnteriorId);
                    var nroAnterior = int.Parse(
                        bodegaAnterior.Nombre.Replace("BODEGA", "").Trim()
                    );

                    var planoAnterior = Repositorio.Obtener<PlanoDeCargaBodega>(p =>
                        p.PlanoDeCarga.Id == plano.Id &&
                        p.BodegaParcel == nroAnterior
                    );

                    if (planoAnterior != null)
                        Repositorio.Remover(planoAnterior);
                }
            }

            // ==============================
            // CREAR / ACTUALIZAR DESTINO
            // ==============================

            if (planoDestino == null)
            {
                Repositorio.Agregar(new PlanoDeCargaBodega
                {                   
                    PlanoDeCarga = plano,
                    BodegaParcel = nroBodegaDestino,
                    MaterialPuerto = materialDestino,
                    FumPreventiva = false,
                    FumCurativa = false
                });
            }
            else
            {
                planoDestino.MaterialPuerto = materialDestino;
            }

            Repositorio.GuardarCambios();
        }

        protected override void Validar(GuardarDetalleSolidoPlanillaTurno comando, Resultado resultado)
        {
        }
    }
}
