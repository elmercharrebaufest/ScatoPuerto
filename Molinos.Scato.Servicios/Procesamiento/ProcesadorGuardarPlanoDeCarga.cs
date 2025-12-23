using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarPlanoDeCarga : ProcesadorModificar<GuardarPlanoDeCarga>
    {
        public ProcesadorGuardarPlanoDeCarga(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio)

            : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(GuardarPlanoDeCarga comando)
        {
            //Validaciones iniciales
            if (comando == null || comando?.Dto == null)
            {
                throw new ArgumentNullException(nameof(comando));
            }

            var planoDeCarga = Repositorio.Obtener<PlanoDeCarga>(comando?.Dto?.Id);
            var lineup = Repositorio.Obtener<LineUp>(x => x.PlanoDeCarga.Id == comando.Dto.Id);
            var moduloDeCargaId = lineup.ModuloDeCarga.Id;
            var esLiq = lineup.Embarque.EsLiquido;

            if (planoDeCarga != null)
            {
                #region HISTORICO

                if (planoDeCarga.FechaDeCreacion == null)
                {
                    planoDeCarga.FechaDeCreacion = DateTime.Now;
                }
                else
                {
                    planoDeCarga.FechaDeModificacion = DateTime.Now;

                    ServicioRepositorio.GenerarLogging(comando.GetType().Name, Newtonsoft.Json.JsonConvert.SerializeObject(comando.Dto), "POST", comando.nombreUsuario);

                    var planodecargahistorico = Repositorio.Agregar(new PlanoDeCargaHistorico
                    {
                        PlanoDeCarga = planoDeCarga,
                        Observaciones = planoDeCarga.Observaciones,
                        CaladoSalida = planoDeCarga.CaladoSalida,
                        Estiba = planoDeCarga.Estiba,
                        AgenciaControlPrivado = planoDeCarga.AgenciaControlPrivado,
                        Cargado = planoDeCarga.Cargado,
                        Enviado = planoDeCarga.Enviado,
                        DefensasMoviles = planoDeCarga.DefensasMoviles,
                        FilePathPlano = planoDeCarga.FilePathPlano,
                        FilePathSecuencia = planoDeCarga.FilePathSecuencia,
                        Fumigacion = planoDeCarga.Fumigacion,
                        EmpresaFumigadora = planoDeCarga.EmpresaFumigadora,
                        FechaDeCreacion = planoDeCarga.FechaDeCreacion.Value,
                        FechaDeModificacion = planoDeCarga.FechaDeModificacion.Value,
                        Usuario = planoDeCarga.Usuario,
                        FechaDeFinalizacion = planoDeCarga.FechaDeFinalizacion,
                        UsuarioFinalizacion = planoDeCarga.UsuarioFinalizacion,
                        CantidadExactaDestino = planoDeCarga.CantidadExactaDestino,
                        CantidadExactaExportador = planoDeCarga.CantidadExactaExportador
                    });

                    if (planoDeCarga.PlanoDeCargaBodega != null)
                    {
                        foreach (var planoBodega in planoDeCarga.PlanoDeCargaBodega.Where(x => x.Cantidad > 0))
                        {
                            var destinos = planoBodega.PlanoDeCargaBodegaDestino.Select(d => new PlanoDeCargaBodegaDestinoHistorico { Destino = d.Destino }).ToList();
                            Repositorio.Agregar(new PlanoDeCargaBodegaHistorico
                            {
                                BodegaParcel = planoBodega.BodegaParcel,
                                Cantidad = planoBodega.Cantidad,
                                MaterialPuerto = planoBodega.MaterialPuerto,
                                Condicion = planoBodega.Condicion,
                                SfFull = planoBodega.SfFull,
                                Destino = planoBodega.Destino,
                                PlanoDeCargaHistorico = planodecargahistorico,
                                TanqueDeAbordo = planoBodega.TanqueDeAbordo,
                                PlanoDeCargaBodegaDestinoHistorico = destinos
                            });
                        }
                    }

                    if (planoDeCarga.CargaComercial != null)
                    {
                        foreach (var car in planoDeCarga.CargaComercial.Where(x => x.Cantidad > 0))
                        {
                            Repositorio.Agregar(new CargaComercialHistorico
                            {
                                Cantidad = car.Cantidad,
                                Exportador = car.Exportador,
                                MaterialPuerto = car.MaterialPuerto,
                                PlanoDeCargaHistorico = planodecargahistorico
                            });
                        }
                    }

                    if (planoDeCarga.AgentesControlPrivado != null)
                    {
                        foreach (var agente in planoDeCarga.AgentesControlPrivado)
                        {
                            Repositorio.Agregar(new PlanoDeCargaAgenteControlPrivadoHistorico
                            {
                                AgenteControlPrivado = agente,
                                PlanoDeCargaHistorico = planodecargahistorico
                            });
                        }
                    }
                }

                #endregion HISTORICO

                planoDeCarga.Estiba = comando.Dto.Estiba != null ? Repositorio.Obtener<Estiba>(comando.Dto.Estiba.Id) : null;
                planoDeCarga.AgenciaControlPrivado = comando.Dto.AgenciaControlPrivado != null ? Repositorio.Obtener<AgenciaControlPrivado>(comando.Dto.AgenciaControlPrivado.Id) : null;

                planoDeCarga.Observaciones = comando.Dto.Observaciones;
                planoDeCarga.DefensasMoviles = comando.Dto.DefensasMoviles;
                planoDeCarga.Cargado = true;
                planoDeCarga.Enviado = comando.Dto.Enviado;
                planoDeCarga.CaladoSalida = comando.Dto.CaladoSalida;
                planoDeCarga.Fumigacion = comando.Dto.Fumigacion;
                planoDeCarga.EmpresaFumigadora = comando.Dto.EmpresaFumigadora;
                planoDeCarga.Usuario = comando.Dto.Usuario;
                planoDeCarga.CantidadExactaDestino = comando.Dto.CantidadExactaDestino;
                planoDeCarga.CantidadExactaExportador = comando.Dto.CantidadExactaExportador;

                if (comando.Dto.UsuarioFinalizacion != null)
                {
                    planoDeCarga.FechaDeFinalizacion = DateTime.Now;
                    planoDeCarga.UsuarioFinalizacion = comando.Dto.UsuarioFinalizacion;
                }

                planoDeCarga.AgentesControlPrivado.Clear();
                if (comando.Dto.AgentesControlPrivado != null)
                {
                    foreach (var agente in comando.Dto.AgentesControlPrivado)
                    {
                        var agenteDb = Repositorio.Obtener<AgenteControlPrivado>(agente.Id);
                        planoDeCarga.AgentesControlPrivado.Add(agenteDb);
                    }
                }


                #region BODEGAS
                var huboCambioMaterial = false;

                //Remuevo los objetos eliminados o los que la cantidad sea <= 0
                var bodegasVacias = comando.Dto.PlanoDeCargaBodegas.Where(bodega => bodega.Id > 0 && bodega.Cantidad <= 0);
                if (bodegasVacias != null)
                {
                    var bodegasEliminar = planoDeCarga.PlanoDeCargaBodega.Where(bodega => bodegasVacias.Any(b => b.Id == bodega.Id)).ToList();
                    if (bodegasEliminar != null && bodegasEliminar.Count() > 0)
                    {
                        foreach (var bodegaEliminar in bodegasEliminar)
                        {
                            var bodegaDestinos = bodegaEliminar.PlanoDeCargaBodegaDestino.ToList();
                            foreach (var bodDestino in bodegaDestinos)
                            {
                                Repositorio.Remover(bodDestino);
                            }
                            Repositorio.Remover(bodegaEliminar);
                        }
                    }
                }

                var bodegas = comando.Dto.PlanoDeCargaBodegas?.Where(bodega => bodega.Cantidad > 0).ToList() ?? new List<PlanoDeCargaBodegaDto>();
                if (bodegas != null && bodegas.Count() > 0)
                {
                    foreach (var bodegaDto in bodegas)
                    {
                        var materialPuerto = bodegaDto.MaterialPuerto != null ? Repositorio.Obtener<MaterialPuerto>(bodegaDto.MaterialPuerto.Id) : null;
                        PlanoDeCargaBodega bodegaDb = Repositorio.Obtener<PlanoDeCargaBodega>(x => x.Id == bodegaDto.Id);
                        IList<PlanoDeCargaBodega> existeCargaEnBodega = Repositorio.Listar<PlanoDeCargaBodega>(x => x.BodegaParcel == bodegaDto.BodegaParcel && x.PlanoDeCarga.Id == planoDeCarga.Id);
                        Destino destino = null;

                        if ((bodegaDto.Destinos == null || bodegaDto.Destinos.Count == 0) && bodegaDto.Destino != null)
                        {
                            destino = Repositorio.Obtener<Destino>(bodegaDto.Destino.Id);
                        }

                        if (bodegaDb != null) // EDIT
                        {
                            bodegaDb.BodegaParcel = bodegaDto.BodegaParcel;
                            bodegaDb.Cantidad = bodegaDto.Cantidad ?? 0;
                            bodegaDb.Condicion = bodegaDto.Condicion;
                            bodegaDb.Destino = destino;
                            bodegaDb.PlanoDeCarga = planoDeCarga;
                            bodegaDb.SfFull = bodegaDto.SfFull;
                            bodegaDb.TanqueDeAbordo = bodegaDto.TanqueDeAbordo;
                            bodegaDb.FumPreventiva = planoDeCarga.Fumigacion;

                            if (bodegaDb.PlanoDeCargaBodegaDestino == null)
                            {
                                bodegaDb.PlanoDeCargaBodegaDestino = new List<PlanoDeCargaBodegaDestino>();
                            }

                            // Si el material puerto es diferente debo actualizarlo en las cargas de balanza y planillas de turnos detalles
                            if (bodegaDb.MaterialPuerto.Id != materialPuerto?.Id)
                            {
                                huboCambioMaterial = true;
                                var nombreBodega = "BODEGA " + bodegaDb.BodegaParcel;
                                var bodegaId = Repositorio.Obtener<Bodega>(b => b.Nombre == nombreBodega).Id;

                                bodegaDb.MaterialPuerto = materialPuerto;
                                var cargasBalanza = Repositorio.Listar<BalanzasCortes>(c => c.ModuloDeCarga_id == moduloDeCargaId && c.Bodega_id == bodegaDb.BodegaParcel).ToList();
                                foreach (var carga in cargasBalanza)
                                {
                                    carga.Material_id = materialPuerto.Id;
                                    carga.CambioMaterial = true;
                                }

                                var detallesSolidos = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(
                                    d => d.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id == moduloDeCargaId && d.Bodega.Id == bodegaId).ToList();
                                foreach (var detalle in detallesSolidos)
                                {
                                    detalle.MaterialPuerto = materialPuerto;
                                    detalle.CambioMaterial = true;
                                }

                                var detallesLiquidos = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>(
                                    d => d.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id == moduloDeCargaId && d.BodegaParcel == bodegaDb.BodegaParcel).ToList();
                                foreach (var detalle in detallesLiquidos)
                                {
                                    detalle.MaterialPuerto = materialPuerto;
                                    detalle.CambioMaterial = true;
                                }
                            }

                            // Cambio de TanqueDeAbordo en planilla de embarque para liquidos (Ya que el campo no es editable)
                            var planillasDeEmbarque = Repositorio.Listar<ModuloDeCargaPlanillaDeEmbarque>(x => x.ModuloDeCarga.Id == moduloDeCargaId && x.BodegaParcel == bodegaDb.BodegaParcel);
                            foreach (var planillaDeEmbarque in planillasDeEmbarque)
                            {
                                planillaDeEmbarque.TanqueDeAbordo = bodegaDto.TanqueDeAbordo;
                                planillaDeEmbarque.MaterialPuerto = materialPuerto;
                            }

                            ActualizarPlanoDeCargaBodegaDestino(bodegaDb, bodegaDto.Destinos);
                        }
                        else // NEW
                        {
                            if (existeCargaEnBodega == null || existeCargaEnBodega.Count() == 0)
                            {
                                bodegaDb = new PlanoDeCargaBodega
                                {
                                    BodegaParcel = bodegaDto.BodegaParcel,
                                    Cantidad = bodegaDto.Cantidad ?? 0,
                                    Condicion = bodegaDto.Condicion,
                                    Destino = destino,
                                    PlanoDeCarga = planoDeCarga,
                                    MaterialPuerto = materialPuerto,
                                    SfFull = bodegaDto.SfFull,
                                    TanqueDeAbordo = bodegaDto.TanqueDeAbordo,
                                    FumPreventiva = planoDeCarga.Fumigacion,
                                    PlanoDeCargaBodegaDestino = new List<PlanoDeCargaBodegaDestino>()
                                };

                                if (bodegaDto.Destinos != null)
                                {
                                    foreach (var destinoDto in bodegaDto.Destinos)
                                    {
                                        var destinoDb = Repositorio.Obtener<Destino>(destinoDto.Destino.Id);
                                        var bodegaDestino = new PlanoDeCargaBodegaDestino { Destino = destinoDb, Cantidad = destinoDto.Cantidad };
                                        if (destinoDto.Exportador != null)
                                        {
                                            var exportadorDb = this.Repositorio.Obtener<Exportador>(e => e.Id == destinoDto.Exportador.Id);
                                            bodegaDestino.Exportador = exportadorDb;
                                        }
                                        bodegaDb.PlanoDeCargaBodegaDestino.Add(bodegaDestino);
                                    }
                                }
                                Repositorio.Agregar(bodegaDb);
                            }
                        }
                    }
                }

                // Si se cambió el material de una bodega, se deben reabrir los turnos
                if (huboCambioMaterial)
                {
                    var planillasDeTurnoCerradas = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(
                        x => x.ModuloDeCarga.Id == moduloDeCargaId && x.Cerrado && x.FechaCierreTurno.HasValue).ToList();

                    foreach (var planillaDeTurno in planillasDeTurnoCerradas)
                    {
                        planillaDeTurno.FechaCierreTurno = null;
                        planillaDeTurno.Cerrado = false;
                        planillaDeTurno.Enviado = false;
                        planillaDeTurno.GuardadoPorTablerista = false;
                        planillaDeTurno.GuardadoPorRecibidor = false;
                    }
                }

                Repositorio.GuardarCambios();

                #endregion BODEGAS          

                ProcesarCargaComercial(comando.Dto.CargasComerciales.ToList(), planoDeCarga.Id);

                LimpiarCarpetaDeArchivos(comando.Dto.Id);
                if (comando.Dto.FilePathPlano != null)
                    planoDeCarga.FilePathPlano = GuardarArchivo(comando.Dto.FilePathPlano, comando.Dto.PlanoDeCargaArchivoPlanoNombre, comando.Dto.Id);
                else
                    planoDeCarga.FilePathPlano = null;

                if (comando.Dto.FilePathSecuencia != null)
                    planoDeCarga.FilePathSecuencia = GuardarArchivo(comando.Dto.FilePathSecuencia, comando.Dto.PlanoDeCargaArchivoSecuenciaNombre, comando.Dto.Id);
                else
                    planoDeCarga.FilePathSecuencia = null;
                //Repositorio.GuardarCambios();
            }
        }

        private void ProcesarCargaComercial(List<CargaComercialDto> cargaComerciales, int planoDeCarga_Id)
        {
            List<CargaComercial> cargasComerciales_DB = Repositorio.Listar<CargaComercial>(x => x.PlanoDeCarga.Id == planoDeCarga_Id).ToList();

            foreach (var cc_DB in cargasComerciales_DB)
            {
                bool exist = false;
                foreach (var cargaComercialFront in cargaComerciales)
                {
                    if (cargaComercialFront.Id <= 0) continue;
                    if (cargaComercialFront.Id == cc_DB.Id && cargaComercialFront.Cantidad > 0 && cargaComercialFront.Exportador != null && cargaComercialFront.MaterialPuerto != null)
                    {
                        exist = true;
                    }
                }
                if (!exist)
                {
                    Repositorio.Remover(cc_DB);
                }
            }

            if (cargaComerciales != null)
            {
                foreach (var cargaComercial in cargaComerciales.Where(x => x.Cantidad > 0))
                {
                    if (cargaComercial.Exportador != null && cargaComercial.MaterialPuerto != null && cargaComercial.Cantidad > 0)
                    {
                        CargaComercial cargaDB = Repositorio.Obtener<CargaComercial>(x => x.Id == cargaComercial.Id);
                        if (cargaDB != null)
                        {
                            cargaDB.Cantidad = cargaComercial.Cantidad;
                            cargaDB.Exportador = Repositorio.Obtener<Exportador>(cargaComercial.Exportador.Id);
                            cargaDB.MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(cargaComercial.MaterialPuerto.Id);
                            cargaDB.PlanoDeCarga = Repositorio.Obtener<PlanoDeCarga>(x => x.Id == planoDeCarga_Id);
                        }
                        else
                        {
                            CargaComercial carga = new CargaComercial()
                            {
                                Cantidad = cargaComercial.Cantidad,
                                Exportador = Repositorio.Obtener<Exportador>(cargaComercial.Exportador.Id),
                                MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(cargaComercial.MaterialPuerto.Id),
                                PlanoDeCarga = Repositorio.Obtener<PlanoDeCarga>(x => x.Id == planoDeCarga_Id)
                            };
                            Repositorio.Agregar(carga);
                        }
                    }
                }
            }
            Repositorio.GuardarCambios();
        }

        private void LimpiarCarpetaDeArchivos(int planoDeCargaId)
        {
            var path = ConfigurationManager.AppSettings["ArchivosPath"];
            var directorio = "PlanosDeCarga";
            DirectoryInfo di = new DirectoryInfo(path + (path.EndsWith("\\") ? "" : "\\") + directorio + "\\" + planoDeCargaId);

            if (di.Exists)
            {
                foreach (FileInfo file in di.GetFiles())
                {
                    file.Delete();
                }
            }
        }

        public string GuardarArchivo(string archivoBase64, string nombreArchivo, int planoDeCargaId)
        {
            try
            {
                var path = ConfigurationManager.AppSettings["ArchivosPath"];
                var directorio = "PlanosDeCarga";
                var archivoBase64Split = archivoBase64.Contains(',') ? archivoBase64.Split(',')[1] : archivoBase64;
                var archivo = Convert.FromBase64String(archivoBase64Split);

                var rutaDestino = path + (path.EndsWith("\\") ? "" : "\\") + directorio + "\\" + planoDeCargaId + "\\" + nombreArchivo;

                if (!Directory.Exists(Path.GetDirectoryName(rutaDestino)))
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(rutaDestino));
                }
                using (var outputStream = File.OpenWrite(rutaDestino))
                {
                    outputStream.Write(archivo, 0, archivo.Length);
                }
                return rutaDestino;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "");
            }
            return null;
        }

        protected override void Validar(GuardarPlanoDeCarga comando, Resultado resultado)
        {
        }

        private void ActualizarPlanoDeCargaBodegaDestino(PlanoDeCargaBodega bodegaDb, IList<PlanoDeCargaBodegaDestinoDto> destinos)
        {
            foreach (var destinoDto in destinos)
            {
                var destinoExistente = bodegaDb.PlanoDeCargaBodegaDestino.Where(d => d.Destino.Id == destinoDto.Destino.Id).FirstOrDefault();
                if (destinoExistente != null)
                {
                    destinoExistente.Cantidad = destinoDto.Cantidad;
                    if (destinoDto.Exportador != null)
                    {
                        var exportadorDb = this.Repositorio.Obtener<Exportador>(e => e.Id == destinoDto.Exportador.Id);
                        destinoExistente.Exportador = exportadorDb;
                    }
                }
                else
                {
                    // Agrego los destino que están en el DTO pero no en DB
                    var destinoDb = Repositorio.Obtener<Destino>(destinoDto.Destino.Id);

                    var nuevoDestino = new PlanoDeCargaBodegaDestino
                    {
                        Destino = destinoDb,
                        Cantidad = destinoDto.Cantidad,
                        PlanoDeCargaBodega = bodegaDb
                    };
                    if (destinoDto.Exportador != null)
                    {
                        var exportadorDb = this.Repositorio.Obtener<Exportador>(e => e.Id == destinoDto.Exportador.Id);
                        nuevoDestino.Exportador = exportadorDb;
                    }
                    this.Repositorio.Agregar(nuevoDestino);
                }
            }

            var destinosEliminar = bodegaDb.PlanoDeCargaBodegaDestino
            .Where(d => !destinos.Any(x => x.Destino.Id == d.Destino.Id))
                .ToList();

            foreach (var destinoEliminar in destinosEliminar)
            {
                Repositorio.Remover(destinoEliminar);
            }
        }
    }
}