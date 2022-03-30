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
    public class ProcesadorGuardarPlanillaDeTurnos : ProcesadorModificar<GuardarPlanillaDeTurnos>
    {
        public ProcesadorGuardarPlanillaDeTurnos(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
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
                if(comando.Dto != null)
                {

                        
                        if (comando.Dto.Id > 0)
                        {
                            var ModuloDeCargaPlanillaDeTurnos_DB = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnos>(comando.Dto.Id);

                            ModuloDeCargaPlanillaDeTurnos_DB.Cerrado = comando.Dto.Cerrado;
                            ModuloDeCargaPlanillaDeTurnos_DB.Enviado = comando.Dto.Enviado;
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
                                        detalle_DB.Destino = Repositorio.Obtener<Destino>(detalle.Destino.Id);
                                        detalle_DB.Cantidad = detalle.Cantidad;
                                    }
                                    else
                                    {
                                        if (detalle.Destino != null)
                                        {
                                            var detalle_DB = new ModuloDeCargaPlanillaDeTurnosDetallesLiquido()
                                            {
                                                ModuloDeCargaPlanillaDeTurnos = ModuloDeCargaPlanillaDeTurnos_DB,
                                                Exportador = Repositorio.Obtener<Exportador>(detalle.Exportador.Id),
                                                Linea_Id = detalle.Linea_Id,
                                                BodegaParcel = detalle.BodegaParcel,
                                                MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(detalle.MaterialPuerto.Id),
                                                Tk = detalle.Tk.ToString(),
                                                Temperatura = detalle.Temperatura,
                                                MedidaInicialCM = detalle.MedidaInicialCM,
                                                MedidaInicialMM = detalle.MedidaInicialMM,
                                                MedidaFinalCM = detalle.MedidaFinalCM,
                                                MedidaFinalMM = detalle.MedidaFinalMM,
                                                Destino = Repositorio.Obtener<Destino>(detalle.Destino.Id),
                                                Cantidad = detalle.Cantidad
                                            };
                                            Repositorio.Agregar(detalle_DB);
                                        }
                                    
                                    }
                                }
                            }

                            if (comando.Dto.ModuloDeCargaPlanillaDeTurnosCortesLiquido != null)
                            {
                                foreach (var corte in comando.Dto.ModuloDeCargaPlanillaDeTurnosCortesLiquido)
                                {
                                    if (corte.Id > 0)
                                    {
                                        var corte_DB = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosCortesLiquido>(corte.Id);

                                        corte_DB.HoraInicio = corte.HoraInicio;
                                        corte_DB.HoraFin = corte.HoraFin;
                                        corte_DB.MotivosDeCorte = Repositorio.Obtener<MotivosDeCorte>(corte.MotivosDeCorte.Id);
                                        corte_DB.Observaciones = corte.Observaciones;
                                        corte_DB.TiempoTotal = corte.TiempoTotal;
                                    }
                                    else
                                    {
                                        var corte_DB = new ModuloDeCargaPlanillaDeTurnosCortesLiquido(){
                                            ModuloDeCargaPlanillaDeTurnos = ModuloDeCargaPlanillaDeTurnos_DB,
                                            HoraInicio = corte.HoraInicio,
                                            HoraFin = corte.HoraFin,
                                            MotivosDeCorte = Repositorio.Obtener<MotivosDeCorte>(corte.MotivosDeCorte.Id),
                                            Observaciones = corte.Observaciones,
                                            TiempoTotal = corte.TiempoTotal
                                        };

                                        Repositorio.Agregar(corte_DB);
                                    }
                                }
                            }


                        }
                        else
                        {
                            var turno_DB = new ModuloDeCargaPlanillaDeTurnos();

                            turno_DB.Fecha = comando.Dto.Fecha;
                            
                            turno_DB.ModuloDeCarga = moduloDeCarga;
                            turno_DB.TurnoPuerto = comando.Dto.TurnoPuerto != null ? Repositorio.Obtener<TurnoPuerto>(comando.Dto.TurnoPuerto.Id) : null;
                            turno_DB.Cerrado = comando.Dto.Cerrado;
                            turno_DB.Enviado = comando.Dto.Enviado;
                            turno_DB.EsLiquido = comando.Dto.EsLiquido;

                        var detalles = new List<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>();   
                            if (comando.Dto.ModuloDeCargaPlanillaDeTurnosDetallesLiquido != null)
                            {
                                foreach (var modulodetalle in comando.Dto.ModuloDeCargaPlanillaDeTurnosDetallesLiquido)
                                {
                                    if (modulodetalle.Linea_Id != null)
                                    {
                                        var ModuloDeCargaPlanillaDeTurnosDetallesLiquido = new ModuloDeCargaPlanillaDeTurnosDetallesLiquido()
                                        {
                                            ModuloDeCargaPlanillaDeTurnos = turno_DB,
                                            Exportador = Repositorio.Obtener<Exportador>(modulodetalle.Exportador.Id),
                                            Linea_Id = modulodetalle.Linea_Id,
                                            BodegaParcel = modulodetalle.BodegaParcel,
                                            MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(modulodetalle.MaterialPuerto.Id),
                                            Tk = modulodetalle.Tk.ToString(),
                                            Temperatura = modulodetalle.Temperatura,
                                            MedidaInicialCM = modulodetalle.MedidaInicialCM,
                                            MedidaInicialMM = modulodetalle.MedidaInicialMM,
                                            MedidaFinalCM = modulodetalle.MedidaFinalCM,
                                            MedidaFinalMM = modulodetalle.MedidaFinalMM,
                                            Destino = Repositorio.Obtener<Destino>(modulodetalle.Destino.Id),
                                            Cantidad = modulodetalle.Cantidad
                                        };
                                        detalles.Add(ModuloDeCargaPlanillaDeTurnosDetallesLiquido);
                                    }
                                }
                            
                                //Repositorio.GuardarCambios();
                            }

                            var cortes = new List<ModuloDeCargaPlanillaDeTurnosCortesLiquido>();
                            if (comando.Dto.ModuloDeCargaPlanillaDeTurnosCortesLiquido != null)
                            {

                                foreach (var corte in comando.Dto.ModuloDeCargaPlanillaDeTurnosCortesLiquido)
                                {

                                    var ModuloDeCargaPlanillaDeTurnosCortesLiquido = new ModuloDeCargaPlanillaDeTurnosCortesLiquido()
                                    {
                                        ModuloDeCargaPlanillaDeTurnos = turno_DB,
                                        HoraInicio = corte.HoraInicio,
                                        HoraFin = corte.HoraFin,
                                        MotivosDeCorte = Repositorio.Obtener<MotivosDeCorte>(corte.MotivosDeCorte.Id),
                                        Observaciones = corte.Observaciones,
                                        TiempoTotal = corte.TiempoTotal

                                    };

                                    cortes.Add(ModuloDeCargaPlanillaDeTurnosCortesLiquido);

                                }

                            }

                            turno_DB.ModuloDeCargaPlanillaDeTurnosCortesLiquido = cortes;
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
