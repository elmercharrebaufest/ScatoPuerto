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

//                moduloDeCargaPlanillaDeTurnos.ModuloDeCargaPlanillaDeTurnos = new List<ModuloDeCargaPlanillaDeTurnos>();


//                foreach (var ModuloDeCargaPlanillaDeTurnos in comando.Dto.ModuloDeCargaPlanillaDeTurnos)
//                {

//                    //   Repositorio.GuardarCambios();

//                    var detalles = new List<ModuloDeCargaPlanillaDeTurnosDetalles>();
//                    foreach (var modulodetalle in ModuloDeCargaPlanillaDeTurnos.ModuloDeCargaPlanillaDeTurnosDetalles)
//                    {
//                        var ModuloDeCargaPlanillaDeTurnosDetalles = new ModuloDeCargaPlanillaDeTurnosDetalles()
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
//                            //  ModuloDeCargaPlanillaDeTurnos = Turnos
//                        };
//                        detalles.Add(ModuloDeCargaPlanillaDeTurnosDetalles);
//                    }

//                    var corte = new List<ModuloDeCargaPlanillaDeTurnosCortes>();

//                    foreach (var moduloCortes in ModuloDeCargaPlanillaDeTurnos.ModuloDeCargaPlanillaDeTurnosCortes)
//                    {
//                        var ModuloDeCargaPlanillaDeTurnosCortes = new ModuloDeCargaPlanillaDeTurnosCortes()
//                        {
//                            HoraInicio = moduloCortes.HoraInicio.ToString(),
//                            HoraFin = moduloCortes.HoraFin.ToString(),
//                            MotivosDeCorte = Repositorio.Obtener<MotivosDeCorte>(moduloCortes.MotivosDeCorte.Id),
//                            Observaciones = moduloCortes.Observaciones,
//                            TiempoTotal = moduloCortes.TiempoTotal

//                            //    ModuloDeCargaPlanillaDeTurnos = Turnos
//                        };
//                        corte.Add(ModuloDeCargaPlanillaDeTurnosCortes);
//                    }

//                    //var ObservacionesDeCalidad = new ObservacionesDeCalidad();
//                    //if(ModuloDeCargaPlanillaDeTurnos.ObservacionesDeCalidadDto != null)
//                    //{
//                    //    ObservacionesDeCalidad.Fecha = ModuloDeCargaPlanillaDeTurnos.ObservacionesDeCalidadDto.Fecha;
//                    //    ObservacionesDeCalidad.Observaciones = ModuloDeCargaPlanillaDeTurnos.ObservacionesDeCalidadDto.Observaciones;
//                    //    ObservacionesDeCalidad.Hora = ModuloDeCargaPlanillaDeTurnos.ObservacionesDeCalidadDto.Hora;
//                    //}

//                    var Turnos = new ModuloDeCargaPlanillaDeTurnos
//                    {
//                        TurnoPuerto = ModuloDeCargaPlanillaDeTurnos.TurnoPuerto != null ? Repositorio.Obtener<TurnoPuerto>(ModuloDeCargaPlanillaDeTurnos.TurnoPuerto.Id) : null,
//                        Cerrado = ModuloDeCargaPlanillaDeTurnos.Cerrado,
//                        Enviado = ModuloDeCargaPlanillaDeTurnos.Enviado,
//                        //     ModuloDeCargaPlanillaDeTurnos = moduloDeCargaPlanillaDeTurnos,
//                        ModuloDeCargaPlanillaDeTurnosDetalles = detalles,
//                        ModuloDeCargaPlanillaDeTurnosCortes = corte,
//                        //   ObservacionesDeCalidad = ObservacionesDeCalidad;

//                    };

//                    moduloDeCargaPlanillaDeTurnos.ModuloDeCargaPlanillaDeTurnos.Add(Turnos);

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