using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarPlanillaDeTurnos : ProcesadorModificar<GuardarPlanillaDeTurnos>
    {
        public ProcesadorGuardarPlanillaDeTurnos(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio)
            : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(GuardarPlanillaDeTurnos comando)
        {
            var moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(comando.IdModuloDeCarga);

            ///////////////////////////
            ///// PROCESO PARA EL HISTORICO /////
            if (moduloDeCarga.FechaDeCreacion == null)
                moduloDeCarga.FechaDeCreacion = DateTime.Now;
            else
            {
                ///// OPERACIONES/TABLERISTAS /////
                moduloDeCarga.FechaDeModificacion = DateTime.Now;

                //Si el turno tiene id > 0 es que ya existe, por lo tanto simplemente lo actualizo.
                if (comando.Dto != null)
                {
                    ServicioRepositorio.GenerarLogging(comando.GetType().Name, Newtonsoft.Json.JsonConvert.SerializeObject(comando.Dto), "POST", comando.nombreUsuario);

                    if (comando.Dto.Id > 0)
                    {
                        var ModuloDeCargaPlanillaDeTurnos_DB = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnos>(comando.Dto.Id);

                        if (comando.Enviado)
                        {
                            ModuloDeCargaPlanillaDeTurnos_DB.GuardadoPorTablerista = true;
                            ModuloDeCargaPlanillaDeTurnos_DB.GuardadoPorRecibidor = comando.Dto.GuardadoPorRecibidor ? true : false;
                        }
                        ModuloDeCargaPlanillaDeTurnos_DB.EsLiquido = true;

                        if (comando.Dto.ModuloDeCargaPlanillaDeTurnosDetallesLiquido != null)
                        {
                            foreach (var detalle in comando.Dto.ModuloDeCargaPlanillaDeTurnosDetallesLiquido)
                            {
                                if (detalle.Id > 0)
                                {
                                    var detalle_DB = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>(detalle.Id);

                                    detalle_DB.Exportador = Repositorio.Obtener<Exportador>(detalle.Exportador.Id);
                                    detalle_DB.Linea_Id = detalle.Linea_Id;
                                    detalle_DB.BodegaParcel = detalle.BodegaParcel;
                                    detalle_DB.MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(detalle.MaterialPuerto.Id);
                                    detalle_DB.Tk = detalle.Tk.ToString();
                                    detalle_DB.Temperatura = detalle.Temperatura;
                                    detalle_DB.MedidaInicialCM = detalle.MedidaInicialCM;
                                    detalle_DB.MedidaInicialMM = detalle.MedidaInicialMM;
                                    detalle_DB.MedidaFinalCM = detalle.MedidaFinalCM;
                                    detalle_DB.MedidaFinalMM = detalle.MedidaFinalMM;
                                    if (detalle.Destino != null)
                                    {
                                        detalle_DB.Destino = Repositorio.Obtener<Destino>(detalle.Destino.Id);
                                    }
                                    else
                                    {
                                        detalle_DB.Destino = null;
                                    }
                                    detalle_DB.Cantidad = detalle.Cantidad;
                                }
                                else
                                {
                                    var detalle_DB = new ModuloDeCargaPlanillaDeTurnosDetallesLiquido();

                                    detalle_DB.ModuloDeCargaPlanillaDeTurnos = ModuloDeCargaPlanillaDeTurnos_DB;
                                    detalle_DB.Exportador = Repositorio.Obtener<Exportador>(detalle.Exportador.Id);
                                    detalle_DB.Linea_Id = detalle.Linea_Id;
                                    detalle_DB.BodegaParcel = detalle.BodegaParcel;
                                    detalle_DB.MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(detalle.MaterialPuerto.Id);
                                    detalle_DB.Tk = detalle.Tk.ToString();
                                    detalle_DB.Temperatura = detalle.Temperatura;
                                    detalle_DB.MedidaInicialCM = detalle.MedidaInicialCM;
                                    detalle_DB.MedidaInicialMM = detalle.MedidaInicialMM;
                                    detalle_DB.MedidaFinalCM = detalle.MedidaFinalCM;
                                    detalle_DB.MedidaFinalMM = detalle.MedidaFinalMM;
                                    if (detalle.Destino != null)
                                    {
                                        detalle_DB.Destino = Repositorio.Obtener<Destino>(detalle.Destino.Id);
                                    }
                                    else
                                    {
                                        detalle_DB.Destino = null;
                                    }

                                    detalle_DB.Cantidad = detalle.Cantidad;

                                    Repositorio.Agregar(detalle_DB);
                                }
                            }
                        }

                        if (comando.Dto.ModuloDeCargaPlanillaDeTurnosCortes != null)
                        {
                            foreach (var corte in comando.Dto.ModuloDeCargaPlanillaDeTurnosCortes)
                            {
                                if (corte.Id > 0)
                                {
                                    var corte_DB = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosCortes>(corte.Id);

                                    corte_DB.HoraInicio = corte.HoraInicio;
                                    corte_DB.HoraFin = corte.HoraFin;
                                    corte_DB.MotivosDeCorte = Repositorio.Obtener<MotivosFallasBalanza>(corte.MotivosDeCorte.Id);
                                    corte_DB.Observaciones = corte.Observaciones;
                                    corte_DB.TiempoTotal = corte.TiempoTotal;
                                    if (corte.TipoLineaEmbarque != null)
                                        corte_DB.TipoLineaEmbarque = Repositorio.Obtener<TipoLineaEmbarque>(corte.TipoLineaEmbarque.Id);
                                    corte_DB.Cantidad = corte.Cantidad;
                                }
                                else
                                {
                                    var corte_DB = new ModuloDeCargaPlanillaDeTurnosCortes()
                                    {
                                        ModuloDeCargaPlanillaDeTurnos = ModuloDeCargaPlanillaDeTurnos_DB,
                                        HoraInicio = corte.HoraInicio,
                                        HoraFin = corte.HoraFin,
                                        MotivosDeCorte = Repositorio.Obtener<MotivosFallasBalanza>(corte.MotivosDeCorte.Id),
                                        Observaciones = corte.Observaciones,
                                        TiempoTotal = corte.TiempoTotal,
                                        Cantidad = corte.Cantidad
                                    };

                                    if (corte.TipoLineaEmbarque != null)
                                    {
                                        corte_DB.TipoLineaEmbarque = Repositorio.Obtener<TipoLineaEmbarque>(corte.TipoLineaEmbarque?.Id);
                                    }

                                    Repositorio.Agregar(corte_DB);
                                }
                            }
                        }
                    }
                    else
                    {
                        var turno_DB = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnos>(comando.Dto.Id);

                        if (turno_DB == null)
                        {
                            if (comando.Dto.FechaTurno != null)
                            {
                                DateTime dtFechaTurno = DateTime.ParseExact(comando.Dto.FechaTurno, "yyyyMMdd HH:mm", null);
                                comando.Dto.Fecha = dtFechaTurno;
                            }

                            turno_DB = new ModuloDeCargaPlanillaDeTurnos();
                            turno_DB.Fecha = comando.Dto.Fecha;
                            turno_DB.ModuloDeCarga = moduloDeCarga;
                            turno_DB.TurnoPuerto = comando.Dto.TurnoPuerto != null ? Repositorio.Obtener<TurnoPuerto>(comando.Dto.TurnoPuerto.Id) : null;
                            turno_DB.EsLiquido = comando.Dto.EsLiquido;
                        }

                        if (comando.Enviado)
                        {
                            turno_DB.GuardadoPorTablerista = true;
                            turno_DB.GuardadoPorRecibidor = comando.Dto.GuardadoPorRecibidor ? true : false;
                        }

                        var detalles = new List<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>();
                        if (comando.Dto.ModuloDeCargaPlanillaDeTurnosDetallesLiquido != null)
                        {
                            foreach (var modulodetalle in comando.Dto.ModuloDeCargaPlanillaDeTurnosDetallesLiquido)
                            {
                                if (modulodetalle.Linea_Id != null)
                                {
                                    var planillaLquido = new ModuloDeCargaPlanillaDeTurnosDetallesLiquido();

                                    planillaLquido.ModuloDeCargaPlanillaDeTurnos = turno_DB;
                                    planillaLquido.Exportador = Repositorio.Obtener<Exportador>(modulodetalle.Exportador.Id);
                                    planillaLquido.Linea_Id = modulodetalle.Linea_Id;
                                    planillaLquido.BodegaParcel = modulodetalle.BodegaParcel;
                                    planillaLquido.MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(modulodetalle.MaterialPuerto.Id);
                                    planillaLquido.Tk = modulodetalle.Tk.ToString();
                                    planillaLquido.Temperatura = modulodetalle.Temperatura;
                                    planillaLquido.MedidaInicialCM = modulodetalle.MedidaInicialCM;
                                    planillaLquido.MedidaInicialMM = modulodetalle.MedidaInicialMM;
                                    planillaLquido.MedidaFinalCM = modulodetalle.MedidaFinalCM;
                                    planillaLquido.MedidaFinalMM = modulodetalle.MedidaFinalMM;
                                    if (modulodetalle.Destino != null)
                                    {
                                        planillaLquido.Destino = Repositorio.Obtener<Destino>(modulodetalle.Destino.Id);
                                    }
                                    else
                                    {
                                        planillaLquido.Destino = null;
                                    }

                                    planillaLquido.Cantidad = modulodetalle.Cantidad;

                                    detalles.Add(planillaLquido);
                                }
                            }

                            //Repositorio.GuardarCambios();
                        }

                        var cortes = new List<ModuloDeCargaPlanillaDeTurnosCortes>();
                        if (comando.Dto.ModuloDeCargaPlanillaDeTurnosCortes != null)
                        {
                            foreach (var corte in comando.Dto.ModuloDeCargaPlanillaDeTurnosCortes)
                            {
                                var ModuloDeCargaPlanillaDeTurnosCortes = new ModuloDeCargaPlanillaDeTurnosCortes()
                                {
                                    ModuloDeCargaPlanillaDeTurnos = turno_DB,
                                    HoraInicio = corte.HoraInicio,
                                    HoraFin = corte.HoraFin,
                                    // MotivosDeCorte = Repositorio.Obtener<MotivosDeCorte>(corte.MotivosDeCorte.Id),
                                    MotivosDeCorte = Repositorio.Obtener<MotivosFallasBalanza>(corte.MotivosDeCorte.Id),
                                    Observaciones = corte.Observaciones,
                                    TiempoTotal = corte.TiempoTotal
                                };

                                cortes.Add(ModuloDeCargaPlanillaDeTurnosCortes);
                            }
                        }

                        turno_DB.ModuloDeCargaPlanillaDeTurnosCortes = cortes;
                        turno_DB.ModuloDeCargaPlanillaDeTurnosDetallesLiquido = detalles;

                        Repositorio.Agregar(turno_DB);
                    }
                    Repositorio.GuardarCambios();
                }
            }
        }

        protected override void Validar(GuardarPlanillaDeTurnos comando, Resultado resultado)
        {
        }
    }
}