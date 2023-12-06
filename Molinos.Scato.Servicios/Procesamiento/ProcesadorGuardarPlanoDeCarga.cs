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
            var planoDeCarga = Repositorio.Obtener<PlanoDeCarga>(comando.Dto.Id);

            //PROCESO PARA EL HISTORICO
            if (planoDeCarga.FechaDeCreacion == null)
                planoDeCarga.FechaDeCreacion = DateTime.Now;
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
                    UsuarioFinalizacion = planoDeCarga.UsuarioFinalizacion
                });



                if (planoDeCarga.PlanoDeCargaBodega != null)
                {
                    foreach (var planoBodega in planoDeCarga.PlanoDeCargaBodega.Where(x => x.Cantidad > 0))
                    {
                        Repositorio.Agregar(new PlanoDeCargaBodegaHistorico
                        {
                            BodegaParcel = planoBodega.BodegaParcel,
                            Cantidad = planoBodega.Cantidad,
                            MaterialPuerto = planoBodega.MaterialPuerto,
                            Condicion = planoBodega.Condicion,
                            SfFull = planoBodega.SfFull,
                            Destino = planoBodega.Destino,
                            PlanoDeCargaHistorico = planodecargahistorico,
                            TanqueDeAbordo = planoBodega.TanqueDeAbordo
                        });
                    }
                }
                //Repositorio.GuardarCambios();


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

                //Repositorio.GuardarCambios();
            }
            //PROCESO PARA EL HISTORICO

            if (comando.Dto.Estiba != null)
                planoDeCarga.Estiba = Repositorio.Obtener<Estiba>(comando.Dto.Estiba.Id);
            else
                planoDeCarga.Estiba = null;

            if (comando.Dto.AgenciaControlPrivado != null)
                planoDeCarga.AgenciaControlPrivado = Repositorio.Obtener<AgenciaControlPrivado>(comando.Dto.AgenciaControlPrivado.Id);
            else
                planoDeCarga.AgenciaControlPrivado = null;

            planoDeCarga.Observaciones = comando.Dto.Observaciones;
            planoDeCarga.DefensasMoviles = comando.Dto.DefensasMoviles;
            planoDeCarga.Cargado = true;
            planoDeCarga.Enviado = comando.Dto.Enviado;
            planoDeCarga.CaladoSalida = comando.Dto.CaladoSalida;
            planoDeCarga.Fumigacion = comando.Dto.Fumigacion;
            planoDeCarga.EmpresaFumigadora = comando.Dto.EmpresaFumigadora;
            planoDeCarga.Usuario = comando.Dto.Usuario;

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
                    planoDeCarga.AgentesControlPrivado.Add(Repositorio.Obtener<AgenteControlPrivado>(agente.Id));
                }
            }

            //Remuevo los objetos eliminados o los que la cantidad sea <= 0
            foreach (var bodega in planoDeCarga.PlanoDeCargaBodega)
            {
                bool exist = false;
                foreach (var bodegaFront in comando.Dto.PlanoDeCargaBodegas)
                {
                    if (bodegaFront.Id <= 0) continue;
                    if (bodegaFront.Id == bodega.Id && bodegaFront.Cantidad > 0)
                    {
                        exist = true;
                    }
                }
                if (!exist)
                {
                    Repositorio.Remover(bodega);
                }
            }

            if (comando.Dto.PlanoDeCargaBodegas != null)
            {
                foreach (var pla in comando.Dto.PlanoDeCargaBodegas.Where(x => x.Cantidad > 0))
                {
                    var destino = pla.Destino != null ? Repositorio.Obtener<Destino>(pla.Destino.Id) : null;
                    var materialPuerto = pla.MaterialPuerto != null ? Repositorio.Obtener<MaterialPuerto>(pla.MaterialPuerto.Id) : null;
                    PlanoDeCargaBodega planoDeCargaBodega = Repositorio.Obtener<PlanoDeCargaBodega>(x => x.Id == pla.Id);

                    if (planoDeCargaBodega != null)
                    {
                        planoDeCargaBodega.BodegaParcel = pla.BodegaParcel;
                        planoDeCargaBodega.Cantidad = (decimal)pla.Cantidad;
                        planoDeCargaBodega.Condicion = pla.Condicion;
                        planoDeCargaBodega.Destino = destino;
                        planoDeCargaBodega.PlanoDeCarga = planoDeCarga;
                        planoDeCargaBodega.MaterialPuerto = materialPuerto;
                        planoDeCargaBodega.SfFull = pla.SfFull;
                        planoDeCargaBodega.TanqueDeAbordo = pla.TanqueDeAbordo;
                    }
                    else
                    {
                        planoDeCarga.PlanoDeCargaBodega.Add(new PlanoDeCargaBodega
                        {
                            BodegaParcel = pla.BodegaParcel,
                            Cantidad = (decimal)pla.Cantidad,
                            Condicion = pla.Condicion,
                            Destino = destino,
                            PlanoDeCarga = planoDeCarga,
                            MaterialPuerto = materialPuerto,
                            SfFull = pla.SfFull,
                            TanqueDeAbordo = pla.TanqueDeAbordo
                        });
                    }
                }
                Repositorio.GuardarCambios();
            }

            ProcesarCargaComercial( comando.Dto.CargasComerciales.ToList(), planoDeCarga.Id);

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
    }
}
