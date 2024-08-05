using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.RitmosBrutosYNetos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Orquestador;
using Ninject.Extensions.Logging;
using NPOI.SS.Formula.Functions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarPlanillaCargaManualSolidos : ProcesadorComando<GuardarPlanillaCargaManualSolidos>
    {
        public ProcesadorGuardarPlanillaCargaManualSolidos(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(GuardarPlanillaCargaManualSolidos comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(comando.IdModuloDeCarga);

                AgregarTurnos(moduloDeCarga, comando.Turnos, comando.Usuario);
                ModificarTurnos(moduloDeCarga, comando.Turnos, comando.Usuario);
                EliminarTurnos(moduloDeCarga, comando.Turnos, comando.Usuario);

                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al guardar planilla de carga manual de solidos: {0}", e);
            }
            return resultado;
        }

        private ModuloDeCargaPlanillaDeTurnosDetallesSolido ConvertirDetalleSolido(ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto detalle)
        {
            var bodega = Repositorio.Obtener<Bodega>(b => b.Nombre == detalle.Bodega.Nombre);
            var materialPuerto = Repositorio.Obtener<MaterialPuerto>(detalle.MaterialPuerto.Id);
            var destino = Repositorio.Obtener<Destino>(detalle.Destino.Id);
            var exportador = Repositorio.Obtener<Exportador>(detalle.Exportador.Id);
            var balanzaPuerto = Repositorio.Obtener<BalanzaPuerto>(b => b.CodigoBalanza == detalle.BalanzaPuerto.CodigoBalanza);
            var siloCelda = Repositorio.Obtener<SiloCelda>(sc => sc.Id == detalle.SiloCelda.Id);
            return new ModuloDeCargaPlanillaDeTurnosDetallesSolido()
            {
                Bodega = bodega,
                MaterialPuerto = materialPuerto,
                Destino = destino,
                Exportador = exportador,
                Cantidad = detalle.Cantidad,
                BalanzaPuerto = balanzaPuerto,
                SiloCelda = siloCelda,
                Fila = detalle.Fila
            };
        }

        private void AgregarTurnos(ModuloDeCarga moduloDeCarga, List<ModuloDeCargaPlanillaDeTurnosDto> turnos, string usuario)
        {
            var turnosAgregar = turnos.Where(t => t.Id == 0).ToList();
            var turnosPuerto = Repositorio.Listar<TurnoPuerto>();

            foreach (var turnoDto in turnosAgregar)
            {
                var turnoPuerto = turnosPuerto.First(tp => tp.Id == turnoDto.TurnoPuerto.Id);

                var turnoDb = new ModuloDeCargaPlanillaDeTurnos()
                {
                    ModuloDeCarga = moduloDeCarga,
                    Fecha = turnoDto.Fecha,
                    TurnoPuerto = turnoPuerto,
                    ModuloDeCargaPlanillaDeTurnosDetallesSolido = new List<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(),
                    ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad = new List<ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad>()
                };

                foreach (var detalleSolido in turnoDto.ModuloDeCargaPlanillaDeTurnosDetallesSolido)
                {
                    turnoDb.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Add(ConvertirDetalleSolido(detalleSolido));
                }

                foreach (var gravedad in turnoDto.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad)
                {
                    var material = Repositorio.Obtener<MaterialPuerto>(gravedad.MaterialPuerto.Id);
                    var gravedadDb = new ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad()
                    {
                        MaterialPuerto = material,
                        KgGravedad = gravedad.KgGravedad,
                        TotalTurnoMaterial = gravedad.TotalTurnoMaterial,
                    };
                    turnoDb.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad.Add(gravedadDb);
                }

                Repositorio.Agregar(turnoDb);
            }

            if (turnosAgregar.Count > 0)
            {
                var log = new LogABM
                {
                    Pantalla = "GuardarPlanillaCargaManualSolidos",
                    Usuario = usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Alta,
                    Entidad = turnosAgregar.ToJson(),
                    ClaseId = moduloDeCarga.Id
                };
                Repositorio.Agregar(log);
            }
        }

        private void ModificarTurnos(ModuloDeCarga moduloDeCarga, List<ModuloDeCargaPlanillaDeTurnosDto> turnos, string usuario)
        {
            var turnosModificar = moduloDeCarga.ModuloDeCargaPlanillaDeTurnos.Where(tdb => turnos.Any(tdto => tdto.Id == tdb.Id)).ToList();
            foreach (var turnoDb in turnosModificar)
            {
                var turnoDto = turnos.First(tdto => tdto.Id == turnoDb.Id);
                ModificarDetallesSolidos(turnoDb, turnoDto);
                ModificarGravedades(turnoDb, turnoDto);
            }

            var turnosLogs = turnos.Where(t => t.Id > 0).ToList();
            if (turnosLogs.Count > 0)
            {
                var log = new LogABM
                {
                    Pantalla = "GuardarPlanillaCargaManualSolidos",
                    Usuario = usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = turnosLogs.ToJson(),
                    ClaseId = moduloDeCarga.Id
                };
                Repositorio.Agregar(log);
            }
        }

        private void EliminarTurnos(ModuloDeCarga moduloDeCarga, List<ModuloDeCargaPlanillaDeTurnosDto> turnos, string usuario)
        {
            var turnosEliminar = moduloDeCarga.ModuloDeCargaPlanillaDeTurnos.Where(tdb => !turnos.Any(tdto => tdto.Id == tdb.Id)).ToList();

            foreach (var turno in turnosEliminar)
            {
                foreach (var detalle in turno.ModuloDeCargaPlanillaDeTurnosDetallesSolido.ToList())
                {
                    Repositorio.Remover(detalle);
                }
                foreach (var gravedad in turno.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad.ToList())
                {
                    Repositorio.Remover(gravedad);
                }
                Repositorio.Remover(turno);
            }

            var json = Conversor.ConvertirList<ModuloDeCargaPlanillaDeTurnos,ModuloDeCargaPlanillaDeTurnosDto>(turnosEliminar).ToJson();
            if (turnosEliminar.Count > 0)
            {
                var log = new LogABM
                {
                    Pantalla = "GuardarPlanillaCargaManualSolidos",
                    Usuario = usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Baja,
                    Entidad = json,
                    ClaseId = moduloDeCarga.Id
                };
                Repositorio.Agregar(log);
            }
        }

        private void ModificarDetallesSolidos(ModuloDeCargaPlanillaDeTurnos turnoDb, ModuloDeCargaPlanillaDeTurnosDto turnoDto)
        {
            var idsModificar = turnoDto.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Where(t => t.Id != 0).Select(t => t.Id).ToList();
            var detallesModificar = turnoDb.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Where(t => idsModificar.Contains(t.Id));
            var detallesAgregar = turnoDto.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Where(t => t.Id == 0);
            var detallesRemover = turnoDb.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Where(d => !detallesModificar.Contains(d)).ToList();

            foreach (var detalle in detallesAgregar)
            {
                var detalleDb = ConvertirDetalleSolido(detalle);
                detalleDb.ModuloDeCargaPlanillaDeTurnos = turnoDb;
                Repositorio.Agregar(detalleDb);
            }

            foreach (var detalle in detallesRemover)
            {
                Repositorio.Remover(detalle);
            }

            foreach (var detalleDb in detallesModificar)
            {
                var detalleDto = turnoDto.ModuloDeCargaPlanillaDeTurnosDetallesSolido.First(ddto => ddto.Id == detalleDb.Id);

                detalleDb.Destino = Repositorio.Obtener<Destino>(detalleDto.Destino.Id);
                detalleDb.Exportador = Repositorio.Obtener<Exportador>(detalleDto.Exportador.Id);
                detalleDb.SiloCelda = Repositorio.Obtener<SiloCelda>(detalleDto.SiloCelda.Id);
                detalleDb.Cantidad = detalleDto.Cantidad;
            }
        }

        private void ModificarGravedades(ModuloDeCargaPlanillaDeTurnos turnoDb, ModuloDeCargaPlanillaDeTurnosDto turnoDto)
        {
            foreach (var gravedadDto in turnoDto.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad)
            {
                ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad gravedadDb;
                if (gravedadDto.Id != 0)
                {
                    gravedadDb = turnoDb.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad.First(g => g.Id == gravedadDto.Id);
                }
                else
                {
                    var material = Repositorio.Obtener<MaterialPuerto>(gravedadDto.MaterialPuerto.Id);
                    gravedadDb = new ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad { MaterialPuerto = material, ModuloDeCargaPlanillaDeTurnos = turnoDb };
                    Repositorio.Agregar(gravedadDb);
                }
                gravedadDb.TotalTurnoMaterial = gravedadDto.TotalTurnoMaterial;
                gravedadDb.KgGravedad = gravedadDto.KgGravedad;
            }
        }
    }
}
