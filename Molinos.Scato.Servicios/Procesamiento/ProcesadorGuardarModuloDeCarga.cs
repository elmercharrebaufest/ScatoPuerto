using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarModuloDeCarga : ProcesadorModificar<GuardarModuloDeCarga>
    {
        public ProcesadorGuardarModuloDeCarga(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio)
            : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(GuardarModuloDeCarga comando)
        {
            var moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(comando.Dto.Id);

            ///////////////////////////
            ///// PROCESO PARA EL HISTORICO /////
            if (moduloDeCarga.FechaDeCreacion == null)
                moduloDeCarga.FechaDeCreacion = DateTime.Now;
            else
            {
                ///// OPERACIONES/TABLERISTAS /////
                moduloDeCarga.FechaDeModificacion = DateTime.Now;

                ServicioRepositorio.GenerarLogging(comando.GetType().Name, Newtonsoft.Json.JsonConvert.SerializeObject(comando.Dto), "POST");

                var modulodecargahistorico = Repositorio.Agregar(new ModuloDeCargaHistorico
                {
                    ModuloDeCarga = moduloDeCarga,
                    Cargado = moduloDeCarga.Cargado,
                    FechaDeCreacion = moduloDeCarga.FechaDeCreacion.Value,
                    FechaDeModificacion = moduloDeCarga.FechaDeModificacion.Value,
                    Usuario = moduloDeCarga.Usuario,
                    FechaDeFinalizacion = moduloDeCarga.FechaDeFinalizacion,
                    UsuarioFinalizacion = moduloDeCarga.UsuarioFinalizacion,
                    Enviado = moduloDeCarga.Enviado
                });

                Repositorio.GuardarCambios();
                ///// OPERACIONES/TABLERISTAS /////

                ///// OPERACIONES /////
                /////////////////////////
                // LÍQUIDOS
                if (moduloDeCarga.ModuloDeCargaHabilitacionDeTanques != null)
                {
                    foreach (var tanques in moduloDeCarga.ModuloDeCargaHabilitacionDeTanques)
                    {
                        Repositorio.Agregar(new ModuloDeCargaHabilitacionDeTanquesHistorico
                        {
                            ModuloDeCargaHistorico = modulodecargahistorico,
                            Tanque1 = tanques.Tanque1,
                            Tanque2 = tanques.Tanque2,
                            Tanque7 = tanques.Tanque7,
                            Tanque8 = tanques.Tanque8,
                            Tanque9 = tanques.Tanque9,
                            Tanque20 = tanques.Tanque20,
                            Tanque30 = tanques.Tanque30,
                            Tanque31 = tanques.Tanque31,
                            Tanque32 = tanques.Tanque32,
                            Tanque33 = tanques.Tanque33,
                            Tanque34 = tanques.Tanque34,
                            Tanque35 = tanques.Tanque35,
                            Tanque36 = tanques.Tanque36,
                            Tanque37 = tanques.Tanque37,
                            Tanque38 = tanques.Tanque38,
                            Tanque40 = tanques.Tanque40
                        });
                    }
                }

                if (moduloDeCarga.ModuloDeCargaLineasDeEmbarque != null)
                {
                    foreach (var lineas in moduloDeCarga.ModuloDeCargaLineasDeEmbarque)
                    {
                        Repositorio.Agregar(new ModuloDeCargaLineasDeEmbarqueHistorico
                        {
                            ModuloDeCargaHistorico = modulodecargahistorico,
                            Linea = lineas.Linea,
                            MaterialPuerto = lineas.MaterialPuerto,
                            TkInicial = lineas.TkInicial,
                            TemperaturaInicial = lineas.TemperaturaInicial,
                            AlturaInicialCM = lineas.AlturaInicialCM,
                            AlturaInicialMM = lineas.AlturaInicialMM,
                            DensidadInicial = lineas.DensidadInicial,
                            TemperaturaFinal = lineas.TemperaturaFinal,
                            Litros = lineas.Litros,
                            DensidadFinal = lineas.DensidadFinal,
                            AlturaFinalCM = lineas.AlturaFinalCM,
                            AlturaFinalMM = lineas.AlturaFinalMM,
                            Kilos = lineas.Kilos,
                            TkFinal = lineas.TkFinal
                        });
                    }
                }
                // LÍQUIDOS
                /////////////////////////


                /////////////////////////
                // SÓLIDOS
                if (moduloDeCarga.ModuloDeCargaElementoGrafico != null)
                {
                    foreach (var elementos in moduloDeCarga.ModuloDeCargaElementoGrafico)
                    {
                        Repositorio.Agregar(new ModuloDeCargaElementoGraficoHistorico
                        {
                            ModuloDeCargaHistorico = modulodecargahistorico,
                            CeldaManoDeEmbarque = elementos.CeldaManoDeEmbarque,
                            Tipo = elementos.Tipo,
                            X = elementos.X,
                            Y = elementos.Y,
                            Forma = elementos.Forma,
                            Width = elementos.Width,
                            Height = elementos.Height,
                            RadioX = elementos.RadioX,
                            RadioY = elementos.RadioY,
                            MaterialPuerto = elementos.MaterialPuerto,
                            Rotacion = elementos.Rotacion
                        });
                    }
                }

                if (moduloDeCarga.ModuloDeCargaManosDeEmbarque != null)
                {
                    foreach (var manos in moduloDeCarga.ModuloDeCargaManosDeEmbarque)
                    {
                        Repositorio.Agregar(new ModuloDeCargaManosDeEmbarqueHistorico
                        {
                            ModuloDeCargaHistorico = modulodecargahistorico,
                            Mano = manos.Mano,
                            Observaciones = manos.Observaciones
                        });
                    }
                }

                //FALTA HISTORICO DE DETALLES

                if (moduloDeCarga.ModuloDeCargaTabiquesDeEmbarque != null)
                {
                    foreach (var tabiques in moduloDeCarga.ModuloDeCargaTabiquesDeEmbarque)
                    {
                        Repositorio.Agregar(new ModuloDeCargaTabiquesDeEmbarqueHistorico
                        {
                            ModuloDeCargaHistorico = modulodecargahistorico,
                            Tabique = tabiques.Tabique,
                            EntreColumna = tabiques.EntreColumna,
                            YColumna = tabiques.YColumna
                        });
                    }
                }
                // SÓLIDOS
                /////////////////////////

                Repositorio.GuardarCambios();
                ///// OPERACIONES /////
            }
            ///// PROCESO PARA EL HISTORICO /////
            ///////////////////////////


            ///////////////////////////
            ///// PROCESO TABLAS ACTUALES /////
            ///// OPERACIONES/TABLERISTAS /////
            moduloDeCarga.Usuario = comando.Dto.Usuario;
            moduloDeCarga.Cargado = true;
            moduloDeCarga.Enviado = comando.Dto.Enviado;

            if (comando.Dto.UsuarioFinalizacion != null)
            {
                moduloDeCarga.FechaDeFinalizacion = DateTime.Now;
                moduloDeCarga.UsuarioFinalizacion = comando.Dto.UsuarioFinalizacion;
            }
            ///// OPERACIONES/TABLERISTAS /////

            ///// OPERACIONES /////
            /////////////////////////
            // LÍQUIDOS
            if (comando.Dto.ModuloDeCargaHabilitacionDeTanques != null)
            {
                Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaHabilitacionDeTanques.ToList());
                foreach (var tanques in comando.Dto.ModuloDeCargaHabilitacionDeTanques)
                {
                    moduloDeCarga.ModuloDeCargaHabilitacionDeTanques.Add(new ModuloDeCargaHabilitacionDeTanques
                    {
                        ModuloDeCarga = moduloDeCarga,
                        Tanque1 = tanques.Tanque1,
                        Tanque2 = tanques.Tanque2,
                        Tanque7 = tanques.Tanque7,
                        Tanque8 = tanques.Tanque8,
                        Tanque9 = tanques.Tanque9,
                        Tanque20 = tanques.Tanque20,
                        Tanque30 = tanques.Tanque30,
                        Tanque31 = tanques.Tanque31,
                        Tanque32 = tanques.Tanque32,
                        Tanque33 = tanques.Tanque33,
                        Tanque34 = tanques.Tanque34,
                        Tanque35 = tanques.Tanque35,
                        Tanque36 = tanques.Tanque36,
                        Tanque37 = tanques.Tanque37,
                        Tanque38 = tanques.Tanque38,
                        Tanque40 = tanques.Tanque40
                    });
                }
            }
            //OPERACIONES Y TABLERISTAS
            if (comando.Dto.ModuloDeCargaLineasDeEmbarque != null)
            {
                Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaLineasDeEmbarque.ToList());
                foreach (var lineas in comando.Dto.ModuloDeCargaLineasDeEmbarque)
                {
                    var materialPuerto = lineas.MaterialPuerto != null ? Repositorio.Obtener<MaterialPuerto>(lineas.MaterialPuerto.Id) : null;
                    moduloDeCarga.ModuloDeCargaLineasDeEmbarque.Add(new ModuloDeCargaLineasDeEmbarque
                    {
                        ModuloDeCarga = moduloDeCarga,
                        Linea = lineas.Linea,
                        MaterialPuerto = materialPuerto,
                        TkInicial = lineas.TkInicial,
                        TemperaturaInicial = lineas.TemperaturaInicial,
                        AlturaInicialCM = lineas.AlturaInicialCM,
                        AlturaInicialMM = lineas.AlturaInicialMM,
                        DensidadInicial = lineas.DensidadInicial,
                        TemperaturaFinal = lineas.TemperaturaFinal,
                        Litros = lineas.Litros,
                        DensidadFinal = lineas.DensidadFinal,
                        AlturaFinalCM = lineas.AlturaFinalCM,
                        AlturaFinalMM = lineas.AlturaFinalMM,
                        Kilos = lineas.Kilos,
                        TkFinal = lineas.TkFinal
                    });
                }
            }
            //OPERACIONES Y TABLERISTAS
            // LÍQUIDOS
            /////////////////////////


            /////////////////////////
            //MODULO DE CARGA SÓLIDOS
            if (comando.Dto.ModuloDeCargaElementoGrafico != null)
            {
                Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaElementoGrafico.ToList());
                foreach (var elementos in comando.Dto.ModuloDeCargaElementoGrafico)
                {
                    var celdasManoDeEmbarque = elementos.CeldaManoDeEmbarque != null ? Repositorio.Obtener<CeldaManoDeEmbarque>(elementos.CeldaManoDeEmbarque.Id) : null;
                    var materialPuerto = elementos.MaterialPuerto != null ? Repositorio.Obtener<MaterialPuerto>(elementos.MaterialPuerto.Id) : null;
                    moduloDeCarga.ModuloDeCargaElementoGrafico.Add(new ModuloDeCargaElementoGrafico
                    {
                        ModuloDeCarga = moduloDeCarga,
                        CeldaManoDeEmbarque = celdasManoDeEmbarque,
                        Tipo = elementos.Tipo,
                        X = elementos.X,
                        Y = elementos.Y,
                        Forma = elementos.Forma,
                        Width = elementos.Width,
                        Height = elementos.Height,
                        RadioX = elementos.RadioX,
                        RadioY = elementos.RadioY,
                        MaterialPuerto = materialPuerto,
                        Rotacion = elementos.Rotacion
                    });
                }
            }

            if (comando.Dto.ModuloDeCargaManosDeEmbarque != null)
            {
                Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaManosDeEmbarque.ToList());
                foreach (var manos in comando.Dto.ModuloDeCargaManosDeEmbarque)
                {
                    var moduloDeCargaManosDeEmbarque = new ModuloDeCargaManosDeEmbarque
                    {
                        ModuloDeCarga = moduloDeCarga,
                        Mano = manos.Mano,
                        Observaciones = manos.Observaciones
                    };

                    moduloDeCargaManosDeEmbarque.ModuloDeCargaManosDeEmbarqueDetalle = new List<ModuloDeCargaManosDeEmbarqueDetalle>();
                    manos.ModuloDeCargaManosDeEmbarqueDetalle.ToList()
                        .ForEach(detalle => moduloDeCargaManosDeEmbarque.ModuloDeCargaManosDeEmbarqueDetalle.Add(new ModuloDeCargaManosDeEmbarqueDetalle
                        {
                            CeldaManoDeEmbarque = detalle.CeldaManoDeEmbarque != null ? Repositorio.Obtener<CeldaManoDeEmbarque>(detalle.CeldaManoDeEmbarque.Id) : null,
                            SentidoManoDeEmbarque = detalle.SentidoManoDeEmbarque != null ? Repositorio.Obtener<SentidoManoDeEmbarque>(detalle.SentidoManoDeEmbarque.Id) : null,
                            PorcentajePorMano = detalle.PorcentajePorMano,
                            AperturaPorton = detalle.AperturaPorton,
                            MasProduccion = detalle.MasProduccion,
                            MaterialPuerto = detalle.MaterialPuerto != null ? Repositorio.Obtener<MaterialPuerto>(detalle.MaterialPuerto.Id) : null
                        }));

                    moduloDeCarga.ModuloDeCargaManosDeEmbarque.Add(new ModuloDeCargaManosDeEmbarque
                    {
                        ModuloDeCarga = moduloDeCarga,
                        Mano = moduloDeCargaManosDeEmbarque.Mano,
                        Observaciones = moduloDeCargaManosDeEmbarque.Observaciones,
                        ModuloDeCargaManosDeEmbarqueDetalle = moduloDeCargaManosDeEmbarque.ModuloDeCargaManosDeEmbarqueDetalle
                    });
                }
            }

            if (comando.Dto.ModuloDeCargaTabiquesDeEmbarque != null)
            {
                Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaTabiquesDeEmbarque.ToList());
                foreach (var tabiques in comando.Dto.ModuloDeCargaTabiquesDeEmbarque)
                {
                    moduloDeCarga.ModuloDeCargaTabiquesDeEmbarque.Add(new ModuloDeCargaTabiquesDeEmbarque
                    {
                        ModuloDeCarga = moduloDeCarga,
                        Tabique = tabiques.Tabique,
                        EntreColumna = tabiques.EntreColumna,
                        YColumna = tabiques.YColumna
                    });
                }
            }
            // SÓLIDOS
            /////////////////////////
            ///// OPERACIONES /////



            ///// TABLERISTAS /////
            moduloDeCarga.IniciarCarga = comando.Dto.IniciarCarga;
            /////////////////////////
            // LÍQUIDOS
            if (comando.Dto.ModuloDeCargaMangueraCarga != null)
            {
                Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaMangueraCarga.ToList());
                foreach (var magueras in comando.Dto.ModuloDeCargaMangueraCarga)
                {
                    moduloDeCarga.ModuloDeCargaMangueraCarga.Add(new ModuloDeCargaMangueraCarga
                    {
                        ModuloDeCarga = moduloDeCarga,
                        FechaConexionMangueras = magueras.FechaConexionMangueras,
                        HoraConexionMangueras = magueras.HoraConexionMangueras,
                        FechaDesconexionMangueras = magueras.FechaDesconexionMangueras,
                        HoraDesconexionMangueras = magueras.HoraDesconexionMangueras,
                        FechaComienzoCarga = magueras.FechaComienzoCarga,
                        HoraComienzoCarga = magueras.HoraComienzoCarga,
                        FechaFinalizacionCarga = magueras.FechaFinalizacionCarga,
                        HoraFinalizacionCarga = magueras.HoraFinalizacionCarga
                    });
                }
            }

            if (comando.Dto.ModuloDeCargaPlanillaDeEmbarque != null)
            {
                Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaPlanillaDeEmbarque.ToList());
                foreach (var planilla in comando.Dto.ModuloDeCargaPlanillaDeEmbarque)
                {
                    var exportador = planilla.Exportador != null ? Repositorio.Obtener<Exportador>(planilla.Exportador.Id) : null;
                    var destino = planilla.Destino != null ? Repositorio.Obtener<Destino>(planilla.Destino.Id) : null;
                    var materialPuerto = planilla.MaterialPuerto != null ? Repositorio.Obtener<MaterialPuerto>(planilla.MaterialPuerto.Id) : null;

                    if (exportador != null && destino != null && materialPuerto != null)
                    {
                        moduloDeCarga.ModuloDeCargaPlanillaDeEmbarque.Add(new ModuloDeCargaPlanillaDeEmbarque
                        {
                            ModuloDeCarga = moduloDeCarga,
                            Exportador = exportador,
                            BodegaParcel = planilla.BodegaParcel,
                            TanqueDeAbordo = planilla.TanqueDeAbordo,
                            Destino = destino,
                            Tk = planilla.Tk,
                            Tn = planilla.Tn,
                            Cantidad = planilla.Cantidad,
                            MaterialPuerto = materialPuerto,
                            FechaComienzoCarga = planilla.FechaComienzoCarga,
                            FechaFinalizacionCarga = planilla.FechaFinalizacionCarga
                        });

                    }

                }
            }

            //Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaPlanillaDeTurnos.ToList());
            //if (comando.Dto.ModuloDeCargaPlanillaDeTurnos != null)
            //{
            //    foreach (var planilla in comando.Dto.ModuloDeCargaPlanillaDeTurnos)
            //    {
            //        var moduloDeCargaPlanillaDeTurnos = new ModuloDeCargaPlanillaDeTurnos
            //        {
            //            ModuloDeCarga = moduloDeCarga,
            //            Fecha = planilla.Fecha
            //        };

            //        moduloDeCargaPlanillaDeTurnos.ModuloDeCargaPlanillaDeTurnos = new List<ModuloDeCargaPlanillaDeTurnos>();
            //        planilla.ModuloDeCargaPlanillaDeTurnos.ToList()
            //        .ForEach(turnos => moduloDeCargaPlanillaDeTurnos.ModuloDeCargaPlanillaDeTurnos.Add(new ModuloDeCargaPlanillaDeTurnos
            //        {
            //            TurnoPuerto = turnos.TurnoPuerto != null ? Repositorio.Obtener<TurnoPuerto>(turnos.TurnoPuerto.Id) : null,
            //            Cerrado = turnos.Cerrado,
            //            Enviado = turnos.Enviado
            //            //public virtual ICollection<ModuloDeCargaPlanillaDeTurnosDetalles> ModuloDeCargaPlanillaDeTurnosDetalles { get; set; }
            //            //public virtual ICollection<ModuloDeCargaPlanillaDeTurnosCortes> ModuloDeCargaPlanillaDeTurnosCortes { get; set; }
            //        }));

            //        moduloDeCarga.ModuloDeCargaPlanillaDeTurnos.Add(new ModuloDeCargaPlanillaDeTurnos
            //        {
            //            ModuloDeCarga = moduloDeCarga,
            //            Fecha = planilla.Fecha,
            //            ModuloDeCargaPlanillaDeTurnos = moduloDeCargaPlanillaDeTurnos.ModuloDeCargaPlanillaDeTurnos
            //        });
            //    }
            //}
            // LÍQUIDOS
            /////////////////////////


            /////////////////////////
            // LÍQUIDOS / SÓLIDOS
            if (comando.Dto.ModuloDeCargaPeriodoDeCarga != null)
            {
                Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaPeriodoDeCarga.ToList());
                var moduloDeCargaPeriodoDeCarga_DB = Repositorio.Obtener<ModuloDeCargaPeriodoDeCarga>(comando.Dto.ModuloDeCargaPeriodoDeCarga[0].Id);

                if (moduloDeCargaPeriodoDeCarga_DB != null)
                {
                    moduloDeCarga.ModuloDeCargaPeriodoDeCarga.Add(new ModuloDeCargaPeriodoDeCarga
                    {
                        Id = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].Id,
                        ModuloDeCarga = moduloDeCarga,
                        FechaAmarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaAmarro,
                        HoraAmarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraAmarro,
                        VientoAmarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].VientoAmarro,
                        DireccionAmarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].DireccionAmarro,
                        FechaDesamarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaDesamarro,
                        HoraDesamarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraDesamarro,
                        VientoDesamarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].VientoDesamarro,
                        DireccionDesamarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].DireccionDesamarro,
                        FechaHabilitacion = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaHabilitacion,
                        HoraHabilitacion = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraHabilitacion,
                        FechaDesconexionMangueras = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaDesconexionMangueras,
                        HoraDesconexionMangueras = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraDesconexionMangueras,
                        FechaConexionMangueras = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaConexionMangueras,
                        HoraConexionMangueras = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraConexionMangueras,
                        FechaComienzoCarga = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaComienzoCarga,
                        HoraComienzoCarga = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraComienzoCarga,
                        FechaFinalizacionCarga = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaFinalizacionCarga,
                        HoraFinalizacionCarga = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraFinalizacionCarga
                    });
                }
                else
                {
                    moduloDeCarga.ModuloDeCargaPeriodoDeCarga.Add(new ModuloDeCargaPeriodoDeCarga
                    {
                        ModuloDeCarga = moduloDeCarga,
                        FechaAmarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaAmarro,
                        HoraAmarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraAmarro,
                        VientoAmarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].VientoAmarro,
                        DireccionAmarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].DireccionAmarro,
                        FechaDesamarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaDesamarro,
                        HoraDesamarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraDesamarro,
                        VientoDesamarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].VientoDesamarro,
                        DireccionDesamarro = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].DireccionDesamarro,
                        FechaHabilitacion = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaHabilitacion,
                        HoraHabilitacion = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraHabilitacion,
                        FechaDesconexionMangueras = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaDesconexionMangueras,
                        HoraDesconexionMangueras = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraDesconexionMangueras,
                        FechaConexionMangueras = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaConexionMangueras,
                        HoraConexionMangueras = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraConexionMangueras,
                        FechaComienzoCarga = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaComienzoCarga,
                        HoraComienzoCarga = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraComienzoCarga,
                        FechaFinalizacionCarga = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].FechaFinalizacionCarga,
                        HoraFinalizacionCarga = comando.Dto.ModuloDeCargaPeriodoDeCarga[0].HoraFinalizacionCarga
                    });
                }

            }

            //Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaNirManualPuerto.ToList());
            //if (comando.Dto.ModuloDeCargaNirManualPuerto != null)
            //{
            //    foreach (var Nir in comando.Dto.ModuloDeCargaNirManualPuerto)
            //    {
            //        //var bodega = Nir.Bodega != null ? Repositorio.Obtener<Bodega>(Nir.Bodega.Id) : null;

            //        moduloDeCarga.ModuloDeCargaNirManualPuerto.Add(new ModuloDeCargaNirManualPuerto
            //        {
            //            Id = Nir.Id,
            //            ModuloDeCarga = moduloDeCarga,
            //            Fecha = Nir.Fecha,
            //            HD = Nir.HD,
            //            Hora = Nir.Hora,
            //            Origen = Nir.Origen,
            //            PH = Nir.PH,
            //            ProtBase = Nir.ProtBase,
            //            Prot_BS = Nir.Prot_BS,
            //            Ritmo = Nir.Ritmo,
            //            Material_id = Nir.Material_id,
            //            Mano = Nir.Mano,
            //            Bodega_id = Nir.Bodega_id,
            //            //Bodega = bodega
            //        });
            //    }
            //}
            // LÍQUIDOS / SÓLIDOS
            /////////////////////////


            /////////////////////////
            // SÓLIDOS
            if (comando.Dto.ModuloDeCargaUmap != null)
            {
                Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaUmap.ToList());
                foreach (var umap in comando.Dto.ModuloDeCargaUmap)
                {
                    moduloDeCarga.ModuloDeCargaUmap.Add(new ModuloDeCargaUmap
                    {
                        ModuloDeCarga = moduloDeCarga,
                        FechaEncendido = umap.FechaEncendido,
                        HoraEncendido = umap.HoraEncendido,
                        FechaApagado = umap.FechaApagado,
                        HoraApagado = umap.HoraApagado,
                        DireccionDelViento = umap.DireccionDelViento,
                        VelocidadDelViento = umap.VelocidadDelViento
                    });
                }
            }

            //Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaBalanzas.ToList());
            //if (comando.Dto.ModuloDeCargaBalanzas != null)
            //{
            //    foreach (var balanzas in comando.Dto.ModuloDeCargaBalanzas)
            //    {
            //        var motivosFallasBalanza = balanzas.MotivosFallasBalanza != null ? Repositorio.Obtener<MotivosFallasBalanza>(balanzas.MotivosFallasBalanza.Id) : null;
                    
            //        moduloDeCarga.ModuloDeCargaBalanzas.Add(new ModuloDeCargaBalanzas
            //        {
                        
            //           // ModuloDeCarga = moduloDeCarga,
            //            MotivosFallasBalanza = motivosFallasBalanza,
            //            Observaciones = balanzas.Observaciones,
                    
            //        });
            //    }
            //}
            // SÓLIDOS
            /////////////////////////
            ///// TABLERISTAS /////

            ///// PROCESO TABLAS ACTUALES /////
            ///////////////////////////
        }

        protected override void Validar(GuardarModuloDeCarga comando, Resultado resultado)
        {

        }
    }
}