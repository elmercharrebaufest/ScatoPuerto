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

    public class ProcesadorSincronizarBalanzasCortes : ProcesadorModificar<SincronizarBalanzasCortes>
    {
        public List<registrosPuerto> listaBalanza7 = new List<registrosPuerto>();
        public List<registrosPuerto> listaBalanza8 = new List<registrosPuerto>();
        public ProcesadorSincronizarBalanzasCortes(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        protected override void ModificarEntidad(SincronizarBalanzasCortes comando)
        {
            try
            {

                var ultima = new DateTime();

                List<BalanzasCortes> lista = new List<BalanzasCortes>();
                var  embarqueBase = Repositorio.Obtener<LineUp>(x => x.ModuloDeCarga.Id == comando.IdModuloDeCarga).Embarque;

                if (embarqueBase.FechaHoraInicioCarga == null || !embarqueBase.FechaHoraInicioCarga.HasValue)
                    return;

                if (embarqueBase.EstadoBuque.Id != 3)
                    EnviarCalidad(embarqueBase);
                
                int embarque = embarqueBase.Id;

                //int embarque = Repositorio.Obtener<LineUp>(x => x.ModuloDeCarga.Id == comando.IdModuloDeCarga).Embarque.Id;

                int vapor_id = embarqueBase.Vapor.Id;

                //int vapor_id = Repositorio.Obtener<Embarque>(x => x.Id == embarque).Vapor.Id;
                
                IList<Carga> cargasBalanza;

                //var ultimoRegistro = Repositorio.Listar<BalanzasCortes>(x => x.ModuloDeCarga_id == comando.IdModuloDeCarga).OrderByDescending(x=>x.Fecha_Corte).Last();
                var listaRegistros = Repositorio.Listar<BalanzasCortes>(x => x.ModuloDeCarga_id == comando.IdModuloDeCarga).OrderBy(x => x.Fecha_Corte);


                if (listaRegistros.Count()>0)
                {
                    var ultimoRegistro = listaRegistros.Last();
                    cargasBalanza = Repositorio.Listar<Carga>(x => x.Vapor.Id == vapor_id && x.ToneladasAW != 0 && x.CargaOpuesta_Id > 0 && x.FechaInicio > ultimoRegistro.Fecha_Corte && x.FechaInicio >= embarqueBase.FechaHoraInicioCarga);
                }
                else
                {
                    cargasBalanza = Repositorio.Listar<Carga>(x => x.Vapor.Id == vapor_id && x.ToneladasAW != 0 && x.CargaOpuesta_Id > 0 && x.FechaInicio >= embarqueBase.FechaHoraInicioCarga);
                }

               


                ObtenerBalanzadasCargas(cargasBalanza);

                ValidarCargasRegistroBalanzasCortes7(comando.IdModuloDeCarga);
                ValidarCargasRegistroBalanzasCortes8(comando.IdModuloDeCarga);

                ValidarBajaCarga(comando.IdModuloDeCarga);

              
               	ProcesarCargasPlanillaSolidos(vapor_id, comando.IdModuloDeCarga, embarqueBase.FechaHoraInicioCarga);

            }
            catch (Exception ex)
            {
                Log.Info("ModificarEntidad: error 1" + ex.Message);
                Log.Info("ModificarEntidad: error 2" + ex.StackTrace);
                throw ex;
            }
        }
        public void EnviarCalidad(Embarque embarque)
        {
            int horaInicio = 0;
            int horaFin = 0;
            var turnos = Repositorio.Listar<TurnoPuerto>();
            var listaTurnos = new List<turnoMemoria>();

            foreach (var item in turnos)
            {
                var horas = item.Nombre.Split('-');

                horaInicio = Convert.ToInt32(horas[0]);
                horaFin = Convert.ToInt32(horas[1]);

                if( embarque.FechaHoraInicioCarga.Value.Hour >=horaInicio && 
                    embarque.FechaHoraInicioCarga.Value.Hour < horaFin && DateTime.Now.Hour> horaFin)
                {
                    var estadoBuq = Repositorio.Obtener<EstadoBuque>(x => x.Id == 3);
                    embarque.EstadoBuque = estadoBuq;
                    Repositorio.GuardarCambios();
                }
            }
            
        }
        public void ProcesarCargasPlanillaSolidos(int vapor_id, int IdModuloDeCarga, DateTime? fechaInicio)
        {
            try
            {
                int horaInicio = 0;
                int horaFin = 0;

                # region Obtengo las planillas para el modulodecarga
                var moduloCarga = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == IdModuloDeCarga);
                var planillasTurnos = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(x => x.ModuloDeCarga.Id == IdModuloDeCarga).OrderByDescending(x => x.Fecha);

                DateTime? ultimaFecha = new DateTime();

              //  ultimaFecha = planillasTurnos.Count() > 0 ? planillasTurnos.FirstOrDefault().Fecha : ultimaFecha;
                
                #endregion

                #region Obtengo el ultimo detalle insertado
                var planillaturnosdetalle = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(x => x.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id == IdModuloDeCarga).LastOrDefault();
                #endregion

                #region Obtengo las cargas del vapor
                IList<Carga> cargaPlanillaSolido = new List<Carga>();
                if (planillaturnosdetalle == null)
                {
                    cargaPlanillaSolido = Repositorio.Listar<Carga>(x => vapor_id == x.Vapor.Id && x.FechaInicio > fechaInicio && x.CargaOpuesta_Id > 0 && x.ToneladasAW != 0).OrderBy(x => x.Fecha).ToList();

                }
                else
                {
                    var ultima = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosUltimaActualizacion>(x => x.ModuloDeCarga.Id == moduloCarga.Id).Fecha;
                    cargaPlanillaSolido = Repositorio.Listar<Carga>(x => vapor_id == x.Vapor.Id &&
                        x.CargaOpuesta_Id > 0 && x.ToneladasAW != 0 && x.FechaInicio > ultima);

                }
                #endregion

                #region Obtengo una lista de turnos del puerto
                var turnos = Repositorio.Listar<TurnoPuerto>();
                var listaTurnos = new List<turnoMemoria>();

                foreach (var item in turnos)
                {
                    var horas = item.Nombre.Split('-');

                    horaInicio = Convert.ToInt32(horas[0]);
                    horaFin = Convert.ToInt32(horas[1]);

                    var memoria = new turnoMemoria
                    {
                        idTurno = item.Id,
                        horaInicio = horaInicio,
                        horaFin = horaFin,
                    };

                    listaTurnos.Add(memoria);

                }
                #endregion


                
                int exportador = 0;
                int bodega = 0;
                int destino = 0;
                DateTime fecha;
                Carga carga1 = new Carga();
                int ultimoTurno = -1;
                int cantidad = 0;
                foreach (var carga in cargaPlanillaSolido)
                {

                    cantidad = 0;
                    carga1 = carga;
                    bool crearModulo = false;

                    var registrosPuerto = Repositorio.Listar<RegistroBalanzaPuerto>(x => x.Id > carga.CargaOpuesta_Id && x.Id < carga.Id && x.NumeroBalanza == carga.NumeroBalanza && x.Tipo == "balanzada");

                    var ultimaCargaInsertada = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosUltimaActualizacion>(x => x.ModuloDeCarga.Id == moduloCarga.Id);
                    
                    if(ultimaCargaInsertada == null)
                    {
                        var actualizarCarga = new ModuloDeCargaPlanillaDeTurnosUltimaActualizacion
                        {
                            Carga_Id = carga.Id,
                            Fecha = carga.FechaInicio,
                            ModuloDeCarga = moduloCarga
                        };

                        Repositorio.Agregar(actualizarCarga);
                        Repositorio.GuardarCambios();
                    }
                    else 
                    {
                    ultimaCargaInsertada.Fecha = carga.FechaInicio;
                    ultimaCargaInsertada.Carga_Id = carga.Id;
                    Repositorio.GuardarCambios();
                    }
                    // var fechaInicial = registrosPuerto.FirstOrDefault().Fecha;
                    var fechaInicial = carga.FechaInicio.Value;
                    var horaInicial = registrosPuerto.FirstOrDefault().Fecha.TimeOfDay.Hours;
                    var turnoInicial = listaTurnos.Where(x => x.horaInicio <= horaInicial && x.horaFin > horaInicial).FirstOrDefault();
                    var planillaDeTurnos = new ModuloDeCargaPlanillaDeTurnos();

                    if (exportador > 0 || bodega > 0 || destino > 0)
                    {
                        //  if (exportador != carga.Exportador.Id || bodega != carga.Bodega.Id || destino != carga.Destino.Id || )
                        if (ultimoTurno > 0 && ultimoTurno != turnoInicial.idTurno)
                            crearModulo = true;
                    }
                    else
                        crearModulo = true;

                    #region creacion ModuloDeCargaPlanillaDeTurnos
                    if (crearModulo)
                    {
                        exportador = carga.Exportador == null ? 0 : carga.Exportador.Id;
                        bodega = carga.Bodega == null ? 0 : carga.Bodega.Id;
                        destino = carga.Destino == null ? 0 : carga.Destino.Id;
                        ultimoTurno = turnoInicial.idTurno;
                        CrearModuloDeCargaPlanillaDeTurnos(moduloCarga.Id, fechaInicial, turnoInicial.idTurno);

                    }
                    #endregion

                    var fechaCarga = new DateTime();
                    foreach (var regPuerto in registrosPuerto)
                    {
                        fechaCarga = regPuerto.Fecha;
                        if (regPuerto.Fecha.TimeOfDay.Hours >= turnoInicial.horaInicio && regPuerto.Fecha.TimeOfDay.Hours < turnoInicial.horaFin)
                        {
                            var bal = Repositorio.Obtener<Balanzada>(x => x.Id == regPuerto.Id && x.NumeroBalanza == regPuerto.NumeroBalanza && x.Tipo == "balanzada");

                            if (bal != null)
                                cantidad += bal.PesoNeto;
                        }
                        else
                        {
                            var moduloTurnoDb = new ModuloDeCargaPlanillaDeTurnos();
                            var moduloTurnoDblista = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(x => x.TurnoPuerto.Id == turnoInicial.idTurno &&
                                x.Fecha.Value >= fechaInicial.Date && x.ModuloDeCarga.Id == IdModuloDeCarga);

                            foreach (var item in moduloTurnoDblista)
                            {

                                if (item.Fecha.Value.Date == fechaInicial.Date)
                                    moduloTurnoDb = item;


                            }


                            var moduloDetalleDB = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(x => x.ModuloDeCargaPlanillaDeTurnos.Id == moduloTurnoDb.Id &&
                            (x.Exportador.Id == carga.Exportador.Id && x.Bodega.Id == carga.Bodega.Id && x.Destino.Id == carga.Destino.Id && x.MaterialPuerto.Id == carga.Material.Id));

                            if (moduloDetalleDB == null)
                            {
                                CrearModuloDeCargaPlanillaDeTurnosDetallesSolido(moduloTurnoDb, carga.Bodega, carga.Material, carga.Destino,
                                 carga.Exportador, cantidad);
                                cantidad = 0;
                            }
                            else
                            {
                                moduloDetalleDB.Cantidad += cantidad;
                                cantidad = 0;

                            }
                            Repositorio.GuardarCambios();
                       
                            turnoInicial = listaTurnos.Where(x => x.horaInicio <= regPuerto.Fecha.TimeOfDay.Hours && x.horaFin > regPuerto.Fecha.TimeOfDay.Hours).FirstOrDefault();

                            cantidad += Repositorio.Obtener<Balanzada>(x => x.Id == regPuerto.Id && x.NumeroBalanza == regPuerto.NumeroBalanza).PesoNeto;

                            CrearModuloDeCargaPlanillaDeTurnos(moduloCarga.Id, fechaInicial, turnoInicial.idTurno);
                        }
                    }
                    //var moduloTurnoDb1 = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(x => x.TurnoPuerto.Id == turnoInicial.idTurno &&
                    //           x.Fecha.Value >= fechaInicial.Date).FirstOrDefault();

                    var moduloTurnoDblista1 = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(x => x.TurnoPuerto.Id == turnoInicial.idTurno &&
                              x.Fecha.Value >= fechaInicial.Date && x.ModuloDeCarga.Id == IdModuloDeCarga);
                    var moduloTurnoDb1 = new ModuloDeCargaPlanillaDeTurnos();
                    foreach (var item in moduloTurnoDblista1)
                    {

                        if (item.Fecha.Value.Date == fechaInicial.Date)
                            moduloTurnoDb1 = item;


                    }
                 
                    var moduloDetalleDb1 = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(x => x.ModuloDeCargaPlanillaDeTurnos.Id == moduloTurnoDb1.Id &&
                     (x.Exportador.Id == carga.Exportador.Id && x.Bodega.Id == carga.Bodega.Id && x.Destino.Id == carga.Destino.Id && x.MaterialPuerto.Id == carga.Material.Id));

                    

                    if (moduloDetalleDb1 == null)
                    {
                        CrearModuloDeCargaPlanillaDeTurnosDetallesSolido(moduloTurnoDb1, carga.Bodega, carga.Material, carga.Destino,
                            carga.Exportador, cantidad);
                        cantidad = 0;
                    }
                    else
                    {
                        moduloDetalleDb1.Cantidad += cantidad;

                    }
                    Repositorio.GuardarCambios();

                }
                Repositorio.GuardarCambios();


                CrearModuloDeCargaPlanillaDeTurnosCortes(IdModuloDeCarga);
            }
            catch (Exception ex)
            {
                Log.Info("ProcesadorSincronizarBalanzasCortes: Error al generar la planilla de solido" + ex.Message);
                throw ex;
            }
        }

        public void CrearModuloDeCargaPlanillaDeTurnosCortes(int idModulodeCarga)
        {

            try
            {
                var moduloTurnoDblista1 = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(x => x.ModuloDeCarga.Id == idModulodeCarga);

                foreach (var turno in moduloTurnoDblista1)
                {
                    string[] horariosTurno = turno.TurnoPuerto.Nombre.Split('-');

                    int fechaInicio = Convert.ToInt32(horariosTurno[0]);
                    int fechaFin = Convert.ToInt32(horariosTurno[1]);
                    DateTime fechaCort = turno.Fecha.Value;
                    //var ListadoCortes = Repositorio.Listar<BalanzasCortes>(x => x.ModuloDeCarga_id == idModulodeCarga && x.Fecha_Inicio >= fechaCort.Date && x.Fecha_Inicio.Value.Hour >= fechaInicio && x.Fecha_Corte.Value.Hour < fechaFin && x.MotivosFallasBalanza_id >0);

                    var listaCortes = Repositorio.Listar<BalanzasCortes>(x => x.ModuloDeCarga_id == idModulodeCarga && x.MotivosFallasBalanza_id > 0);
                    var ListadoCortes = listaCortes.Where(x => x.Fecha_Inicio.Value.Hour >= fechaInicio && x.Fecha_Inicio.Value.Hour < fechaFin && x.Fecha_Inicio.Value.Date >= fechaCort.Date);



                    foreach (var corte in ListadoCortes)
                    {

                        var turnoDB = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosCortes>(x => x.idBalanzaCorte == corte.Id);
                        double tiempo = corte.Fecha_Corte.Value.Subtract(corte.Fecha_Inicio.Value).TotalMinutes;
                        TimeSpan t = new TimeSpan(0, (int)tiempo, 0);
                        if (turnoDB == null)
                        {
                            var turnosCortes = new ModuloDeCargaPlanillaDeTurnosCortes
                            {
                                ModuloDeCargaPlanillaDeTurnos = turno,
                                HoraInicio = corte.Fecha_Inicio.Value.ToShortTimeString(),
                                HoraFin = corte.Fecha_Corte.Value.ToShortTimeString(),
                                Observaciones = corte.Observaciones,
                                TiempoTotal = t.ToString(),
                                //  MotivosDeCorte = Repositorio.Obtener<MotivosDeCorte>(x => x.Id == corte.MotivosFallasBalanza_id),
                                MotivosDeCorte = Repositorio.Obtener<MotivosFallasBalanza>(x => x.Id == corte.MotivosFallasBalanza_id),
                                idBalanzaCorte = corte.Id,
                            };
                            Repositorio.Agregar(turnosCortes);
                        }
                        else
                        {
                            turnoDB.HoraInicio = corte.Fecha_Inicio.Value.ToShortTimeString();
                            turnoDB.HoraFin = corte.Fecha_Corte.Value.ToShortTimeString();
                            turnoDB.Observaciones = corte.Observaciones;
                            turnoDB.TiempoTotal = t.ToString();
                        }


                        Repositorio.GuardarCambios();
                    }

                    Repositorio.GuardarCambios();

                }

                var listadoBC = Repositorio.Listar<BalanzasCortes, int>(x => x.Id, x => x.ModuloDeCarga_id == idModulodeCarga);
                var listadoTC = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnosCortes>(x => x.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id == idModulodeCarga);

                foreach (var itemTC in listadoTC)
                {
                    var existe = listadoBC.Where(x => x == itemTC.idBalanzaCorte).Count();

                    if (existe < 1)
                        Repositorio.Remover(itemTC);
                }
                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                Log.Info("ProcesadorSincronizarBalanzasCortes: Error al generar los cortes en solido" + ex.InnerException);
                throw ex;
            }
           
        }


        public void CrearModuloDeCargaPlanillaDeTurnosDetallesSolido(ModuloDeCargaPlanillaDeTurnos planilla, Bodega bodega, MaterialPuerto material, Destino destino,
            Exportador exportador, int cantidad)
        {
            try
            {
                ModuloDeCargaPlanillaDeTurnosDetallesSolido moduloSolido = new ModuloDeCargaPlanillaDeTurnosDetallesSolido
                {
                    //int Id { get; set; }
                    ModuloDeCargaPlanillaDeTurnos = planilla,
                    Bodega = bodega,
                    MaterialPuerto = material,
                    Destino = destino,
                    Exportador = exportador,
                    Cantidad = cantidad,
                 //   FechaCarga = DateTime.Today
                };
                Repositorio.Agregar(moduloSolido);
                Repositorio.GuardarCambios();

            }
            catch (Exception)
            {

                throw;
            }
        }

        public void CrearModuloDeCargaPlanillaDeTurnos(int idModuloCarga, DateTime fechaInicial, int idTurno)
        {
            try
            {
                bool existe = false;
                var moduloTurnoDblista1 = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(x => x.TurnoPuerto.Id == idTurno &&
                             x.Fecha.Value >= fechaInicial.Date && x.ModuloDeCarga.Id == idModuloCarga);
               // var moduloTurnoDb1 = new ModuloDeCargaPlanillaDeTurnos();
                foreach (var item in moduloTurnoDblista1)
                {

                    if (item.Fecha.Value.Date == fechaInicial.Date)
                        existe = true;
                }

                if(!existe)
                {
                    var planillaDeTurnos = new ModuloDeCargaPlanillaDeTurnos
                    {
                        ModuloDeCarga = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == idModuloCarga),
                        EsLiquido = false,
                        Fecha = fechaInicial,
                        Enviado = false,
                        Cerrado = false,
                        TurnoPuerto = Repositorio.Obtener<TurnoPuerto>(x => x.Id == idTurno)

                    };

                Repositorio.Agregar(planillaDeTurnos);
                Repositorio.GuardarCambios();
                }
               
            }
            catch (Exception)
            {

                throw;
            }
        }

        public void ValidarBajaCarga(int idModulodeCarga)
        {

            try
            {
                List<BalanzasCortes> cortes7 = new List<BalanzasCortes>();
                List<BalanzasCortes> cortes8 = new List<BalanzasCortes>();

                ModuloDeCarga mod = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == idModulodeCarga);

                foreach (registrosPuerto reg in listaBalanza7)
                {
                    var fechasInicio = reg.fechaInicio;
                    var fechasFin = reg.fechaFin;

                    var PesoTotal = (int)Repositorio.Sumar<Balanzada>(x => x.PesoNeto, x => x.Id >= reg.idInicio && x.Id <= reg.idFin && x.NumeroBalanza == reg.numeroBalanza);
                    var car = Repositorio.Obtener<Carga>(x => x.Id == reg.numeroCarga);

                    double tiempo = fechasFin.Subtract(fechasInicio).TotalMinutes;

                    int kgHora = (int)((PesoTotal / tiempo) * 60);

                    if (((kgHora / 1000) < 950 && kgHora > 0))
                    {
                        BalanzasCortes bc = new BalanzasCortes
                        {
                            Fecha_Inicio = fechasInicio,
                            Fecha_Corte = fechasFin,
                            ModuloDeCarga_id = mod.Id,
                            NumeroBalanza = reg.numeroBalanza,
                            Kg = PesoTotal,
                            Tn = PesoTotal / 1000,
                            Bodega_id = car.Bodega == null ? 0 : car.Bodega.Id,
                            Material_id = car.Material == null ? 0 : car.Material.Id,
                        };
                        cortes7.Add(bc);
                        //GuardarRegistroBalanzasCortes(bc);

                    }

                }

                foreach (registrosPuerto reg in listaBalanza8)
                {
                    var fechasInicio = reg.fechaInicio;
                    var fechasFin = reg.fechaFin;

                    var PesoTotal = (int)Repositorio.Sumar<Balanzada>(x => x.PesoNeto, x => x.Id >= reg.idInicio && x.Id <= reg.idFin && x.NumeroBalanza == reg.numeroBalanza);
                    var car = Repositorio.Obtener<Carga>(x => x.Id == reg.numeroCarga);

                    double tiempo = fechasFin.Subtract(fechasInicio).TotalMinutes;

                    int kgHora = (int)((PesoTotal / tiempo) * 60);

                    if ((kgHora / 1000) < 950)
                    {
                        BalanzasCortes bc = new BalanzasCortes
                        {
                            Fecha_Inicio = fechasInicio,
                            Fecha_Corte = fechasFin,
                            ModuloDeCarga_id = mod.Id,
                            NumeroBalanza = reg.numeroBalanza,
                            Kg = PesoTotal,
                            Tn = PesoTotal / 1000,
                            Bodega_id = car.Bodega == null ? 0 : car.Bodega.Id,
                            Material_id = car.Material == null ? 0 : car.Material.Id,
                        };
                        cortes8.Add(bc);
                        //    GuardarRegistroBalanzasCortes(bc);

                    }


                }

                for (int i = 0; i < cortes7.Count() - 1; i++)
                {

                    var tiempo = cortes7[i + 1].Fecha_Inicio.Value.Subtract(cortes7[i].Fecha_Corte.Value).TotalMinutes;

                    if (tiempo < 5 && cortes7[i].Bodega_id == cortes7[i + 1].Bodega_id && cortes7[i].Material_id == cortes7[i + 1].Material_id)
                    {
                        cortes7[i + 1].Kg += cortes7[i].Kg;
                        cortes7[i + 1].Tn += cortes7[i].Tn;
                        cortes7[i + 1].Fecha_Inicio = cortes7[i].Fecha_Inicio;
                        cortes7[i].Kg = -100;
                    }

                }

                foreach (var cor7 in cortes7)
                {
                    if (cor7.Kg > 0)
                        GuardarRegistroBalanzasCortes(cor7);
                }

                for (int i = 0; i < cortes8.Count()-1; i++)
                {

                    var tiempo = cortes8[i + 1].Fecha_Inicio.Value.Subtract(cortes8[i].Fecha_Corte.Value).TotalMinutes;

                    if (tiempo < 5 && cortes8[i].Bodega_id == cortes8[i + 1].Bodega_id && cortes8[i].Material_id == cortes8[i + 1].Material_id)
                    {
                        cortes8[i + 1].Kg += cortes8[i].Kg;
                        cortes8[i + 1].Tn += cortes8[i].Tn;
                        cortes8[i + 1].Fecha_Inicio = cortes8[i].Fecha_Inicio;
                        cortes8[i].Kg = -100;
                    }

                }
                foreach (var cor8 in cortes8)
                {
                    if (cor8.Kg > 0)
                        GuardarRegistroBalanzasCortes(cor8);
                }

            }
            catch (Exception ex)
            {

                throw;
            }
        }



        public void ValidarCargasRegistroBalanzasCortes7(int idModulodeCarga)
        {
            try
            {
                BalanzasCortes bc = new BalanzasCortes();
                
                var item = new registrosPuerto();
                var itemAnterior = new registrosPuerto();
                for (int i = 0; i < listaBalanza7.Count; i++)
                {
                    item = listaBalanza7[i];

                    if ((item.fechaError?.Count ?? 0) > 0)
                    {
                        foreach (var dicError in item.fechaError)
                        {
                            foreach (var fechaEr in dicError)
                            {
                                bc.Fecha_Inicio = fechaEr.Key;
                                bc.Fecha_Corte = fechaEr.Value;
                                bc.ModuloDeCarga_id = idModulodeCarga;
                                bc.NumeroBalanza = item.numeroBalanza;
                                GuardarRegistroBalanzasCortes(bc);
                            }
                        }

                    }

                    if (i > 0)
                        itemAnterior = listaBalanza7[i - 1];
                    else
                        continue;

                    TimeSpan result = item.fechaInicio.Subtract(itemAnterior.fechaFin);

                    if (result.TotalMinutes > 5)
                    {

                        bc.Fecha_Inicio = itemAnterior.fechaFin;
                        bc.Fecha_Corte = item.fechaInicio;
                        bc.ModuloDeCarga_id = idModulodeCarga;
                        bc.NumeroBalanza = item.numeroBalanza;

                        GuardarRegistroBalanzasCortes(bc);
                    }


                }
            }
            catch (Exception ex)
            {

                throw;
            }
        }


        public void ValidarCargasRegistroBalanzasCortes8(int idModulodeCarga)
        {
            try
            {
                BalanzasCortes bc = new BalanzasCortes();

                var item = new registrosPuerto();

                var itemAnterior = new registrosPuerto();
                for (int i = 0; i < listaBalanza8.Count; i++)
                {
                    item = listaBalanza8[i];

                    if ((item.fechaError?.Count ?? 0) > 0)
                    {
                        foreach (var dicError in item.fechaError)
                        {
                            foreach (var fechaEr in dicError)
                            {
                                bc.Fecha_Inicio = fechaEr.Key;
                                bc.Fecha_Corte = fechaEr.Value;
                                bc.ModuloDeCarga_id = idModulodeCarga;
                                bc.NumeroBalanza = item.numeroBalanza;
                                GuardarRegistroBalanzasCortes(bc);
                            }
                        }

                    }

                    if (i > 0)
                        itemAnterior = listaBalanza8[i - 1];
                    else
                        continue;




                    TimeSpan result = item.fechaInicio.Subtract(itemAnterior.fechaFin);

                    if (result.TotalMinutes > 5)
                    {

                        bc.Fecha_Inicio = itemAnterior.fechaFin;
                        bc.Fecha_Corte = item.fechaInicio;
                        bc.ModuloDeCarga_id = idModulodeCarga;
                        bc.NumeroBalanza = item.numeroBalanza;

                        GuardarRegistroBalanzasCortes(bc);
                    }


                }
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        public void GuardarRegistroBalanzasCortes(BalanzasCortes itemGuardar)
        {
            try
            {
                var item = Repositorio.Listar<BalanzasCortes>(x => x.Fecha_Corte == itemGuardar.Fecha_Corte && x.Fecha_Inicio == itemGuardar.Fecha_Inicio &&
                x.NumeroBalanza == itemGuardar.NumeroBalanza && x.ModuloDeCarga_id == itemGuardar.ModuloDeCarga_id);

                if(item.Count() == 0)
                {
                    Repositorio.Agregar(itemGuardar);
                    Repositorio.GuardarCambios();

                }

            }
            catch (Exception ex)
            {

                throw ex;
            }


        }


        public void ObtenerBalanzadasCargas(IList<Carga> cargasBalanza)
        {

            foreach (Carga car in cargasBalanza)
            {
                registrosPuerto regP = new registrosPuerto();
                var balanzadasCarga = new List<RegistroBalanzaPuerto>();
                bool vieneError = false;

                balanzadasCarga = Repositorio.Listar<RegistroBalanzaPuerto>(x => x.Id >= car.CargaOpuesta_Id && x.Id <= car.Id && x.NumeroBalanza == car.NumeroBalanza).OrderBy(x => x.Id).ToList();

                regP.numeroBalanza = car.NumeroBalanza;
                regP.numeroCarga = car.Id;
                regP.fechaError = new List<Dictionary<DateTime, DateTime>>();
                DateTime fechaSiguiente = new DateTime();
                DateTime fechaError = new DateTime();
                DateTime inicioNuevo = new DateTime();

                foreach (RegistroBalanzaPuerto registro in balanzadasCarga)
                {
                    if (vieneError)
                    {
                        regP = new registrosPuerto();
                        regP.numeroBalanza = car.NumeroBalanza;
                        regP.numeroCarga = car.Id;
                        regP.fechaError = new List<Dictionary<DateTime, DateTime>>();
                        regP.fechaInicio = inicioNuevo;
                        regP.idInicio = registro.Id;
                        vieneError = false;
                    }
                    
                    switch (registro.Tipo)
                    {
                        case "inicio":
                            regP.fechaInicio = registro.Fecha;
                            regP.idInicio = registro.Id;
                            break;

                        case "fin":
                            regP.fechaFin = registro.Fecha;
                            regP.idFin= registro.Id;
                            fechaSiguiente = registro.Fecha;
                            break;
                        case "error":
                            if (fechaError == DateTime.MinValue)
                            {
                                fechaSiguiente = DateTime.MinValue;
                                fechaError = registro.Fecha;
                            }

                            break;
                        default:
                            fechaSiguiente = registro.Fecha;
                            break;
                    }

                    if (fechaError != DateTime.MinValue && fechaSiguiente != DateTime.MinValue)
                    {
                        double tiempo = fechaSiguiente.Subtract(fechaError).TotalMinutes;

                        if (tiempo > 5)
                        {
                            regP.fechaFin = fechaError;
                            regP.idFin = registro.Id;
                            Dictionary<DateTime, DateTime> reg = new Dictionary<DateTime, DateTime>();
                            reg.Add(fechaError, fechaSiguiente);
                            regP.fechaError.Add(reg);
                            vieneError = true;

                            if (regP.numeroBalanza == "7")
                                listaBalanza7.Add(regP);
                            else
                                listaBalanza8.Add(regP);

                            inicioNuevo = fechaSiguiente;
                        }

                        fechaError = DateTime.MinValue;
                        fechaSiguiente = DateTime.MinValue;
                        //break;
                    }
                }
                if (regP.numeroBalanza == "7")
                    listaBalanza7.Add(regP);
                else
                    listaBalanza8.Add(regP);

            }
        }


        public class registrosPuerto
        {
            public int numeroCarga { get; set; }
            public string numeroBalanza { get; set; }
            public DateTime fechaInicio { get; set; }
            public DateTime fechaFin { get; set; }

            public int idInicio { get; set; }
            public int idFin { get; set; }
            public List<Dictionary<DateTime, DateTime>> fechaError { get; set; }

        }
        public class turnoMemoria
        {
            public int idTurno { get; set; }
            public int horaInicio { get; set; }
            public int horaFin { get; set; }
        }
        protected override void Validar(SincronizarBalanzasCortes comando, Resultado resultado)
        {

        }


    }
}
