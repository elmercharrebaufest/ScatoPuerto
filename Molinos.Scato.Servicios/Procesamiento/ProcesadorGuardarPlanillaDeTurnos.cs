//using Molinos.Scato.Dominio.Comandos;
//using Molinos.Scato.Dominio.Entidades;
//using Molinos.Scato.Repositorio;
//using Molinos.Scato.Servicios.Conversiones;
//using Ninject.Extensions.Logging;
//using System;
//using System.Collections.Generic;
//using System.Linq;

//namespace Molinos.Scato.Servicios.Procesamiento
//{
//    public class ProcesadorGuardarPlanillaDeTurnos : ProcesadorModificar<GuardarPlanillaDeTurnos>
//    {
//        public ProcesadorGuardarPlanillaDeTurnos(IRepositorio repositorio, IConversor conversor, ILogger log)
//            : base(repositorio, conversor, log)
//        {
//        }

//        protected override void ModificarEntidad(GuardarPlanillaDeTurnos comando)
//        {


//            var moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(comando.IdModuloDeCarga);

//            ///////////////////////////
//            ///// PROCESO PARA EL HISTORICO /////
//            if (moduloDeCarga.FechaDeCreacion == null)
//                moduloDeCarga.FechaDeCreacion = DateTime.Now;
//            else
//            {
//                ///// OPERACIONES/TABLERISTAS /////
//                moduloDeCarga.FechaDeModificacion = DateTime.Now;

//                moduloDeCargaPlanillaDeTurnos.ModuloDeCargaPlanillaDeTurnosTurnos = new List<ModuloDeCargaPlanillaDeTurnosTurnos>();


//                foreach (var ModuloDeCargaPlanillaDeTurnosTurnos in comando.Dto.ModuloDeCargaPlanillaDeTurnosTurnos)
//                {

//                    //   Repositorio.GuardarCambios();

//                    var detalles = new List<ModuloDeCargaPlanillaDeTurnosTurnosDetalles>();
//                    foreach (var modulodetalle in ModuloDeCargaPlanillaDeTurnosTurnos.ModuloDeCargaPlanillaDeTurnosTurnosDetalles)
//                    {
//                        var ModuloDeCargaPlanillaDeTurnosTurnosDetalles = new ModuloDeCargaPlanillaDeTurnosTurnosDetalles()
//                        {
//                            Exportador = Repositorio.Obtener<Exportador>(modulodetalle.Exportador.Id),
//                            Linea = modulodetalle.Linea.ToString(),
//                            BodegaParcel = modulodetalle.BodegaParcel,
//                            MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(modulodetalle.MaterialPuerto.Id),
//                            Tk = modulodetalle.Tk.ToString(),
//                            Temperatura = modulodetalle.Temperatura,
//                            MedidaInicialCM = modulodetalle.MedidaInicialCM,
//                            MedidaInicialMM = modulodetalle.MedidaInicialMM,
//                            MedidaFinalCM = modulodetalle.MedidaFinalCM,
//                            MedidaFinalMM = modulodetalle.MedidaFinalMM,
//                            Destino = Repositorio.Obtener<Destino>(modulodetalle.Destino.Id),
//                            Cantidad = modulodetalle.Cantidad
//                            //  ModuloDeCargaPlanillaDeTurnosTurnos = turnosturnos
//                        };
//                        detalles.Add(ModuloDeCargaPlanillaDeTurnosTurnosDetalles);
//                    }

//                    var corte = new List<ModuloDeCargaPlanillaDeTurnosTurnosCortes>();

//                    foreach (var moduloCortes in ModuloDeCargaPlanillaDeTurnosTurnos.ModuloDeCargaPlanillaDeTurnosTurnosCortes)
//                    {
//                        var ModuloDeCargaPlanillaDeTurnosTurnosCortes = new ModuloDeCargaPlanillaDeTurnosTurnosCortes()
//                        {
//                            HoraInicio = moduloCortes.HoraInicio.ToString(),
//                            HoraFin = moduloCortes.HoraFin.ToString(),
//                            MotivosDeCorte = Repositorio.Obtener<MotivosDeCorte>(moduloCortes.MotivosDeCorte.Id),
//                            Observaciones = moduloCortes.Observaciones,
//                            TiempoTotal = moduloCortes.TiempoTotal

//                            //    ModuloDeCargaPlanillaDeTurnosTurnos = turnosturnos
//                        };
//                        corte.Add(ModuloDeCargaPlanillaDeTurnosTurnosCortes);
//                    }

//                    //var ObservacionesDeCalidad = new ObservacionesDeCalidad();
//                    //if(ModuloDeCargaPlanillaDeTurnosTurnos.ObservacionesDeCalidadDto != null)
//                    //{
//                    //    ObservacionesDeCalidad.Fecha = ModuloDeCargaPlanillaDeTurnosTurnos.ObservacionesDeCalidadDto.Fecha;
//                    //    ObservacionesDeCalidad.Observaciones = ModuloDeCargaPlanillaDeTurnosTurnos.ObservacionesDeCalidadDto.Observaciones;
//                    //    ObservacionesDeCalidad.Hora = ModuloDeCargaPlanillaDeTurnosTurnos.ObservacionesDeCalidadDto.Hora;
//                    //}

//                    var turnosturnos = new ModuloDeCargaPlanillaDeTurnosTurnos
//                    {
//                        TurnoPuerto = ModuloDeCargaPlanillaDeTurnosTurnos.TurnoPuerto != null ? Repositorio.Obtener<TurnoPuerto>(ModuloDeCargaPlanillaDeTurnosTurnos.TurnoPuerto.Id) : null,
//                        Cerrado = ModuloDeCargaPlanillaDeTurnosTurnos.Cerrado,
//                        Enviado = ModuloDeCargaPlanillaDeTurnosTurnos.Enviado,
//                        //     ModuloDeCargaPlanillaDeTurnos = moduloDeCargaPlanillaDeTurnos,
//                        ModuloDeCargaPlanillaDeTurnosTurnosDetalles = detalles,
//                        ModuloDeCargaPlanillaDeTurnosTurnosCortes = corte,
//                        //   ObservacionesDeCalidad = ObservacionesDeCalidad;

//                    };

//                    moduloDeCargaPlanillaDeTurnos.ModuloDeCargaPlanillaDeTurnosTurnos.Add(turnosturnos);

//                    moduloDeCarga.ModuloDeCargaPlanillaDeTurnos.Add(moduloDeCargaPlanillaDeTurnos);
//                }

//                Repositorio.GuardarCambios();
//            }
//        }

//        protected override void Validar(GuardarPlanillaDeTurnos comando, Resultado resultado)
//        {

//        }


//    }
//}