using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Servicios.Conversiones.Impl.Perfiles;

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

                ServicioRepositorio.GenerarLogging(comando.GetType().Name, Newtonsoft.Json.JsonConvert.SerializeObject(comando.Dto), "POST", comando.nombreUsuario);

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
                        var tipoLineaEmbarque = lineas.TipoLineaEmbarque != null?  Repositorio.Obtener<TipoLineaEmbarque>(lineas.TipoLineaEmbarque.Id) : null;
                        Repositorio.Agregar(new ModuloDeCargaLineasDeEmbarqueHistorico
                        {
                            ModuloDeCargaHistorico = modulodecargahistorico,
                            Linea = lineas.Linea,
                            TipoLineaEmbarque = tipoLineaEmbarque,
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

            moduloDeCarga = this.ActualizarModuloDeCarga_LineasDeEmbarque(comando.Dto.ModuloDeCargaLineasDeEmbarque, moduloDeCarga);

            
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
            if(comando.Dto.ModuloDeCargaPlanillaDeEmbarque != null)
            {
                ProcesarPlanillaDeEmbarque(comando.Dto.ModuloDeCargaPlanillaDeEmbarque.ToList(), comando.Dto.Id);
            }
            else
            {
                ProcesarPlanillaDeEmbarque(new List<ModuloDeCargaPlanillaDeEmbarqueDto>() { }, comando.Dto.Id);
            }

            if (comando.Dto.ModuloDeCargaPlanillaDeEmbarque != null)
            {
                Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaPlanillaDeEmbarque.ToList());
                foreach (var planilla in comando.Dto.ModuloDeCargaPlanillaDeEmbarque)
                {
                    var exportador = planilla.Exportador != null ? Repositorio.Obtener<Exportador>(planilla.Exportador.Id) : null;
                    //var destino = planilla.Destino != null ? Repositorio.Obtener<Destino>(planilla.Destino.Id) : null;
                    var materialPuerto = planilla.MaterialPuerto != null ? Repositorio.Obtener<MaterialPuerto>(planilla.MaterialPuerto.Id) : null;

                    if (exportador != null && materialPuerto != null)
                    {
                        moduloDeCarga.ModuloDeCargaPlanillaDeEmbarque.Add(new ModuloDeCargaPlanillaDeEmbarque
                        {
                            ModuloDeCarga = moduloDeCarga,
                            Exportador = exportador,
                            BodegaParcel = planilla.BodegaParcel,
                            TanqueDeAbordo = planilla.TanqueDeAbordo,
                            //Destino = destino,
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

          
        }

        private ModuloDeCarga ActualizarModuloDeCarga_LineasDeEmbarque(IList<ModuloDeCargaLineasDeEmbarqueDto> moduloDeCargaLineasDeEmbarque, ModuloDeCarga moduloDeCargaDB)
        {
            if (moduloDeCargaLineasDeEmbarque != null)
            {
                //Repositorio.RemoverTodos(moduloDeCarga.ModuloDeCargaLineasDeEmbarque.ToList());
                //REVISAR QUE REGISTROS SON NUEVOS Y CUALES A MODIFICAR

                #region Armado de listados

                var lineasDeEmbarque = moduloDeCargaDB.ModuloDeCargaLineasDeEmbarque.ToList();
                var lineasDeEmbarqueInsertar = moduloDeCargaLineasDeEmbarque.Where(x => x.Id == 0);
                var lineasDeEmbarqueEliminar = lineasDeEmbarque.Where(x => !moduloDeCargaLineasDeEmbarque.Select(y => y.Id).Contains(x.Id));
                var lineasDeEmbarqueActualizar = lineasDeEmbarque.Where(la => moduloDeCargaLineasDeEmbarque.Select(l => l.Id).Contains(la.Id));

                #endregion

                #region Eliminar
                foreach (var linea in lineasDeEmbarqueEliminar) { Repositorio.Remover(linea); }

                #endregion

                #region Insertar

                foreach (var linea in lineasDeEmbarqueInsertar) 
                {
                    var lineaEmbarque = new ModuloDeCargaLineasDeEmbarque();                                

                    lineaEmbarque.ModuloDeCarga = moduloDeCargaDB;
                    lineaEmbarque.Linea = linea.Linea;
                    lineaEmbarque.TipoLineaEmbarque = new TipoLineaEmbarque { Linea = linea.TipoLineaEmbarque.Linea, Id = linea.TipoLineaEmbarque.Id };
                    lineaEmbarque.MaterialPuerto = new MaterialPuerto
                    {
                        Id = linea.MaterialPuerto.Id,
                        Descripcion = linea.MaterialPuerto.Descripcion,
                        DescripcionCorta = linea.MaterialPuerto.DescripcionCorta,
                        DescripcionCortaIngles = linea.MaterialPuerto.DescripcionCortaIngles,
                        Almacen = linea.MaterialPuerto.Almacen_Id == null ? null : new Almacen { Id = (int)linea.MaterialPuerto.Almacen_Id, Descripcion = linea.MaterialPuerto.AlmacenDesc },
                        CodigoSAP = linea.MaterialPuerto.CodigoSAP,
                        Color = linea.MaterialPuerto.Color,
                        EsLiquido = linea.MaterialPuerto.EsLiquido
                    };
                    lineaEmbarque.TkInicial = linea.TkInicial;
                    lineaEmbarque.TkFinal = linea.TkFinal;
                    lineaEmbarque.TemperaturaInicial = linea.TemperaturaInicial;
                    lineaEmbarque.TemperaturaFinal = linea.TemperaturaFinal;
                    lineaEmbarque.AlturaInicialCM = linea.AlturaInicialCM;
                    lineaEmbarque.AlturaInicialMM = linea.AlturaInicialMM;
                    lineaEmbarque.AlturaFinalCM = linea.AlturaFinalCM;
                    lineaEmbarque.AlturaFinalMM = linea.AlturaFinalMM;
                    lineaEmbarque.DensidadInicial = linea.DensidadInicial;
                    lineaEmbarque.DensidadFinal = linea.DensidadFinal;
                    lineaEmbarque.Litros = linea.Litros;
                    lineaEmbarque.Kilos = linea.Kilos;

                    moduloDeCargaDB.ModuloDeCargaLineasDeEmbarque.Add(lineaEmbarque);                                 
                     
                }
                #endregion

                #region Actualizar               

                foreach (var linea in lineasDeEmbarqueActualizar)
                {                    
                                       
                    moduloDeCargaDB.FechaDeModificacion = DateTime.Now;

                    var lineaDto = moduloDeCargaLineasDeEmbarque.FirstOrDefault(l => l.Id == linea.Id);
                    if (lineaDto != null)
                    {
                        var lineaDeEmbarque = Repositorio.Obtener<ModuloDeCargaLineasDeEmbarque>(x => x.Id == linea.Id);
                        var material = Repositorio.Obtener<MaterialPuerto>(x => x.Id == linea.MaterialPuerto.Id);
                        var tipoLineaEmbarque = Repositorio.Obtener<TipoLineaEmbarque>(x => x.Id == linea.TipoLineaEmbarque.Id);

                        linea.ModuloDeCarga = moduloDeCargaDB;
                        linea.Linea = tipoLineaEmbarque.Linea;
                        linea.TipoLineaEmbarque = tipoLineaEmbarque;
                        linea.MaterialPuerto = material;
                        linea.TkInicial = lineaDto.TkInicial;
                        linea.TemperaturaInicial = lineaDto.TemperaturaInicial;
                        linea.AlturaInicialCM = lineaDto.AlturaInicialCM;
                        linea.AlturaInicialMM = lineaDto.AlturaInicialMM;
                        linea.DensidadInicial = lineaDto.DensidadInicial;
                        linea.TemperaturaFinal = lineaDto.TemperaturaFinal;
                        linea.Litros = lineaDto.Litros;
                        linea.DensidadFinal = lineaDto.DensidadFinal;
                        linea.AlturaFinalCM = lineaDto.AlturaFinalCM;
                        linea.AlturaFinalMM = lineaDto.AlturaFinalMM;
                        linea.Kilos = lineaDto.Kilos;
                        linea.TkFinal = lineaDto.TkFinal;
                        linea.KilosFinales = lineaDto.KilosFinales;
                        linea.LitrosFinales = lineaDto.LitrosFinales;
                    }                   
                }

                #endregion
                Repositorio.GuardarCambios();
            }

            

            return moduloDeCargaDB;
        }

        private void ProcesarPlanillaDeEmbarque(List<ModuloDeCargaPlanillaDeEmbarqueDto> planillaDeEmbarque, int moduloDeCarga_Id)
        {
            try
            {

                List<ModuloDeCargaPlanillaDeEmbarque> planillasDeEmbarque_DB = Repositorio.Listar<ModuloDeCargaPlanillaDeEmbarque>(x => x.ModuloDeCarga.Id == moduloDeCarga_Id).ToList();

                foreach (var planilla_DB in planillasDeEmbarque_DB)
                {
                    bool exist = false;
                    foreach (var planilla in planillaDeEmbarque)
                    {
                        if (planilla.Id <= 0) continue;
                        if (planilla.Id == planilla_DB.Id && planilla.Exportador != null && planilla.MaterialPuerto != null)
                        {
                            exist = true;
                        }
                    }
                    if (!exist)
                    {
                        Repositorio.Remover(planilla_DB);
                    }
                }

                if (planillaDeEmbarque != null)
                {
                    foreach (var planilla in planillaDeEmbarque)
                    {
                        if (planilla.Exportador != null && planilla.MaterialPuerto != null)
                        {
                            ModuloDeCargaPlanillaDeEmbarque planillaDB = Repositorio.Obtener<ModuloDeCargaPlanillaDeEmbarque>(x => x.Id == planilla.Id);
                            if (planillaDB != null)
                            {
                                planillaDB.ModuloDeCarga = Repositorio.Obtener<ModuloDeCarga>(moduloDeCarga_Id);
                                planillaDB.Exportador = Repositorio.Obtener<Exportador>(planilla.Exportador.Id);
                                planillaDB.MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(planilla.MaterialPuerto.Id);
                                //planillaDB.Destino = Repositorio.Obtener<Destino>(x => x.Id == planilla.Destino.Id);
                                planillaDB.FechaComienzoCarga = planilla.FechaComienzoCarga;
                                planillaDB.FechaFinalizacionCarga = planilla.FechaFinalizacionCarga;
                                planillaDB.TanqueDeAbordo = planilla.TanqueDeAbordo;
                                planillaDB.Tk = planilla.Tk;
                                planillaDB.Tn = planilla.Tn;
                                planillaDB.Cantidad = planilla.Cantidad;
                                planillaDB.BodegaParcel = planilla.BodegaParcel;
                            }
                            else
                            {
                                planillaDB = new ModuloDeCargaPlanillaDeEmbarque()
                                {
                                    ModuloDeCarga = Repositorio.Obtener<ModuloDeCarga>(moduloDeCarga_Id),
                                    Exportador = Repositorio.Obtener<Exportador>(planilla.Exportador.Id),
                                    MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(planilla.MaterialPuerto.Id),
                                    //Destino = Repositorio.Obtener<Destino>(x => x.Id == planilla.Destino.Id),
                                    FechaComienzoCarga = planilla.FechaComienzoCarga,
                                    FechaFinalizacionCarga = planilla.FechaFinalizacionCarga,
                                    TanqueDeAbordo = planilla.TanqueDeAbordo,
                                    Tk = planilla.Tk,
                                    Tn = planilla.Tn,
                                    Cantidad = planilla.Cantidad,
                                    BodegaParcel = planilla.BodegaParcel
                                };

                                Repositorio.Agregar(planillaDB);
                            }
                        }
                    }
                }
                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        protected override void Validar(GuardarModuloDeCarga comando, Resultado resultado)
        {

        }
    }
}