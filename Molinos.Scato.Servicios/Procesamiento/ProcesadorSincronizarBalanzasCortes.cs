using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Impl;
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
        public ProcesadorSincronizarBalanzasCortes(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio)
            : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(SincronizarBalanzasCortes comando)
        {
            try
            {
                var  embarqueBase = Repositorio.Obtener<LineUp>(x => x.ModuloDeCarga.Id == comando.IdModuloDeCarga).Embarque;

                if (embarqueBase.FechaHoraInicioCarga == null || !embarqueBase.FechaHoraInicioCarga.HasValue)
                    return;
                
                //Si es un buque que no está en calidad (3 = ControlCalidad)
                if (embarqueBase.EstadoBuque.Id != 3)
                    EnviarCalidad(embarqueBase);
                

                IList<Carga> cargasBalanza;

                //Obtengo todos los registros de la tabla BalanzasCortes cuya fecha y hora sea posterior a la fecha de inicio de la carga.
                var listaRegistros = Repositorio.Listar<BalanzasCortes>(x => x.ModuloDeCarga_id == comando.IdModuloDeCarga).Where(x => x.Fecha_Inicio >= embarqueBase.FechaHoraInicioCarga).OrderBy(x => x.Fecha_Corte);

                if (listaRegistros.Count() > 0)
                {
                    var ultimoRegistro = listaRegistros.Last();
                    cargasBalanza = Repositorio.Listar<Carga>(x => x.Vapor.Id == embarqueBase.Vapor.Id && x.ToneladasAW != 0 && x.CargaOpuesta_Id > 0 && x.FechaInicio > ultimoRegistro.Fecha_Corte && x.FechaInicio >= embarqueBase.FechaHoraInicioCarga);
                }
                else
                {
                    cargasBalanza = Repositorio.Listar<Carga>(x => x.Vapor.Id == embarqueBase.Vapor.Id && x.ToneladasAW != 0 && x.CargaOpuesta_Id > 0 && x.FechaInicio >= embarqueBase.FechaHoraInicioCarga);
                }

                ObtenerBalanzadasCargas(cargasBalanza);

                ValidarCargasRegistroBalanzasCortes(comando.IdModuloDeCarga, listaBalanza7);
                ValidarCargasRegistroBalanzasCortes(comando.IdModuloDeCarga, listaBalanza8);

                
                ValidarBajaCarga(comando.IdModuloDeCarga);              

                //Genero los turnos
                ProcesarCargasPlanillaSolidos(comando.IdModuloDeCarga);

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
            try
            {
                int horaInicio = 0;
                int horaFin = 0;
                var turnos = Repositorio.Listar<TurnoPuerto>();

                foreach (var item in turnos)
                {
                    var horas = item.Nombre.Split('-');

                    horaInicio = Convert.ToInt32(horas[0]);
                    horaFin = Convert.ToInt32(horas[1]);

                    if (embarque.FechaHoraInicioCarga.Value.Hour >= horaInicio &&
                       embarque.FechaHoraInicioCarga.Value.Hour < horaFin &&
                       DateTime.Now.Hour > horaFin)
                    {
                        var estadoBuq = Repositorio.Obtener<EstadoBuque>(x => x.Id == 3);
                        embarque.EstadoBuque = estadoBuq;
                        Repositorio.GuardarCambios();
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            
            
        }    


        public void ProcesarCargasPlanillaSolidos(int IdModuloDeCarga)
        {
            try
            {
                //Recorro todos los registros de Balanzas cortes
                var balanzasCortes = Repositorio.Listar<BalanzasCortes>(x => x.ModuloDeCarga_id == IdModuloDeCarga).OrderBy(x => x.Fecha_Inicio).ToList();

                if (balanzasCortes != null && balanzasCortes.Count > 0)
                {
                    foreach (var cb in balanzasCortes)
                    {
                        ModuloDeCargaPlanillaDeTurnosUltimaActualizacion moduloDeCargaPlanillaDeTurnosUltimaActualizacion = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosUltimaActualizacion>(x => x.ModuloDeCarga.Id == IdModuloDeCarga);
                        List<RegistroBalanzaPuerto> registroBalanzaPuerto = new List<RegistroBalanzaPuerto>();
                        //obtengo todos los RegistroBalanzaPuerto                            
                            
                        if(moduloDeCargaPlanillaDeTurnosUltimaActualizacion != null)
                        {
                            registroBalanzaPuerto = Repositorio.Listar<RegistroBalanzaPuerto>(x => x.Fecha >= cb.Fecha_Inicio && x.Fecha <= cb.Fecha_Corte && x.NumeroBalanza == cb.NumeroBalanza && x.Id > moduloDeCargaPlanillaDeTurnosUltimaActualizacion.Carga_Id ).ToList();
                            if(registroBalanzaPuerto != null && registroBalanzaPuerto.Count > 0) 
                                moduloDeCargaPlanillaDeTurnosUltimaActualizacion.Carga_Id = registroBalanzaPuerto.Last().Id;
                        }
                        else
                        {
                            registroBalanzaPuerto = Repositorio.Listar<RegistroBalanzaPuerto>(x => x.Fecha >= cb.Fecha_Inicio && x.Fecha <= cb.Fecha_Corte && x.NumeroBalanza == cb.NumeroBalanza).ToList();
                            moduloDeCargaPlanillaDeTurnosUltimaActualizacion = new ModuloDeCargaPlanillaDeTurnosUltimaActualizacion();
                            moduloDeCargaPlanillaDeTurnosUltimaActualizacion.ModuloDeCarga = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == IdModuloDeCarga);
                            if (registroBalanzaPuerto != null && registroBalanzaPuerto.Count > 0) 
                                moduloDeCargaPlanillaDeTurnosUltimaActualizacion.Carga_Id = registroBalanzaPuerto.Last().Id;
                            Repositorio.Agregar(moduloDeCargaPlanillaDeTurnosUltimaActualizacion);
                        }
                        Repositorio.GuardarCambios();
                        if(registroBalanzaPuerto != null && registroBalanzaPuerto.Count > 0) CrearPlanillaDeTurnos(registroBalanzaPuerto, cb, IdModuloDeCarga);   
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Info("ProcesadorSincronizarBalanzasCortes: Error al generar la planilla de solido" + ex.Message);
                throw ex;
            }
        }

        public void CrearPlanillaDeTurnos(List<RegistroBalanzaPuerto> rbp, BalanzasCortes cb, int ModuloDeCargaId)
        {

            if(rbp != null && rbp.Count > 0)
            {
                //Id Turno actual
                int idTurno = (rbp[0].Fecha.Hour / 6) + 1;

                int idInicio = rbp[0].Id;
                int idFin = rbp[rbp.Count - 1].Id;

                ProcesarPlanilla(cb, ModuloDeCargaId, idTurno, idInicio, idFin);

                return;           
            }

        }

        private void ProcesarPlanilla(BalanzasCortes cb, int ModuloDeCargaId, int idTurno, int idInicio, int idFin)
        {
            try
            {


                Bodega bodega = cb.Bodega_id != null ? Repositorio.Obtener<Bodega>(x => x.Id == cb.Bodega_id) : null;
                MaterialPuerto materialPuerto = cb.Material_id != null ? Repositorio.Obtener<MaterialPuerto>(x => x.Id == cb.Material_id) : null;
                Exportador exportador = cb.Exportador_Id != null ? Repositorio.Obtener<Exportador>(x => x.Id == cb.Exportador_Id) : null;
                Destino destino = Repositorio.Obtener<Destino>(x => x.Id == cb.Destino_Id);
                //generar turno (TurnoSolido)
                ModuloDeCargaPlanillaDeTurnos turno;
                switch (cb.CargaNormal)
                {
                    case true: //Carga normal
                               //Crear turno en ModuloDeCargaPlanillaDeTurnosSolido
                        turno = this.ServicioRepositorio.CrearModuloDeCargaPlanillaDeTurnos(ModuloDeCargaId, cb.Fecha_Inicio.Value, idTurno);
                        //Creo el Detalle
                        this.ServicioRepositorio.CrearModuloDeCargaPlanillaDeTurnosDetallesSolido(turno, bodega, materialPuerto, destino, exportador, Convert.ToInt32(cb.Kg), Convert.ToInt32(cb.CargaNormal));
                        break;

                    case false: //Baja carga
                                //Crear turno en ModuloDeCargaPlanillaDeTurnosSolido
                        turno = this.ServicioRepositorio.CrearModuloDeCargaPlanillaDeTurnos(ModuloDeCargaId, cb.Fecha_Inicio.Value, idTurno);

                        //Creo el Detalle                               
                        this.ServicioRepositorio.CrearModuloDeCargaPlanillaDeTurnosDetallesSolido(turno, bodega, materialPuerto, destino, exportador, Convert.ToInt32(cb.Kg), Convert.ToInt32(cb.CargaNormal));

                        //Crear turno en ModuloDeCargaPlanillaDeTurnosCortes
                        this.ServicioRepositorio.CrearModuloDeCargaPlanillaDeTurnosCortes(turno, cb);
                        break;

                    case null: //Corte
                               //Crear turno en ModuloDeCargaPlanillaDeTurnosSolido
                        turno = this.ServicioRepositorio.CrearModuloDeCargaPlanillaDeTurnos(ModuloDeCargaId, cb.Fecha_Inicio.Value, idTurno);

                        //Crear turno en ModuloDeCargaPlanillaDeTurnosCortes
                        this.ServicioRepositorio.CrearModuloDeCargaPlanillaDeTurnosCortes(turno, cb);
                        break;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            
        }

        public class TurnoPuertoPlanilla
        {
            public int Carga_Id { get; set; }
            public int RegistroPuerto_Id { get; set; }
            public DateTime Fecha { get; set; }
            public int TurnoId { get; set; }
            public string NumeroBalanza { get; set; }
            public int ModuloDeCargaPlanillaDeTurnos_Id { get; set; }
            public int PesoNeto { get; set; }
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

                    var PesoTotal = reg.kilosTotalesCarga;
                    var car = Repositorio.Obtener<Carga>(x => x.Id == reg.numeroCarga);

                    double tiempo = fechasFin.Subtract(fechasInicio).TotalMinutes;

                    int kgHora = (int)((PesoTotal / tiempo) * 60);

                    BalanzasCortes bc = new BalanzasCortes
                    {
                        Fecha_Inicio = fechasInicio,
                        Fecha_Corte = fechasFin,
                        ModuloDeCarga_id = mod.Id,
                        NumeroBalanza = reg.numeroBalanza,
                        Kg = reg.fechaError.Count == 0?  PesoTotal: 0,
                        Tn = reg.fechaError.Count == 0 ? PesoTotal / 1000: 0,
                        Bodega_id = car.Bodega == null ? 0 : car.Bodega.Id,
                        Material_id = car.Material == null ? 0 : car.Material.Id,
                        Exportador_Id = car.Exportador == null ? 0 : car.Exportador.Id,
                        Destino_Id = car.Destino == null ? 0 : car.Destino.Id,
                        CargaNormal = (kgHora / 1000) >= 950
                    };
                    cortes7.Add(bc);

                }

                foreach (registrosPuerto reg in listaBalanza8)
                {
                    var fechasInicio = reg.fechaInicio;
                    var fechasFin = reg.fechaFin;

                    var PesoTotal = reg.kilosTotalesCarga;
                    var car = Repositorio.Obtener<Carga>(x => x.Id == reg.numeroCarga);

                    double tiempo = fechasFin.Subtract(fechasInicio).TotalMinutes;

                    int kgHora = (int)((PesoTotal / tiempo) * 60);

                    //if (((kgHora / 1000) < 950 && kgHora > 0))
                    //{
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
                        Exportador_Id = car.Exportador == null ? 0 : car.Exportador.Id,
                        Destino_Id = car.Destino == null ? 0 : car.Destino.Id,
                        CargaNormal = (kgHora / 1000) >= 950
                    };
                    cortes8.Add(bc);
                }

                for (int i = 0; i < cortes7.Count() - 1; i++)
                {

                    var tiempo = cortes7[i + 1].Fecha_Inicio.Value.Subtract(cortes7[i].Fecha_Corte.Value).TotalMinutes;
                    //Si el espacion entre cargas duró menos de 5 minutos, y la siguiente tiene la misma bodega y material, los unifico.
                    if (tiempo <= 5 && cortes7[i].Bodega_id == cortes7[i + 1].Bodega_id && cortes7[i].Material_id == cortes7[i + 1].Material_id && cortes7[i].CargaNormal == false && cortes7[i + 1].CargaNormal == false)
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

                    if (tiempo <= 5 && cortes8[i].Bodega_id == cortes8[i + 1].Bodega_id && cortes8[i].Material_id == cortes8[i + 1].Material_id && cortes8[i].CargaNormal == false && cortes8[i + 1].CargaNormal == false)
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
                throw ex;
            }
        }

        public void ValidarCargasRegistroBalanzasCortes(int idModulodeCarga, List<registrosPuerto> registrosPuertoBalanza)
        {
            try
            {
                if (registrosPuertoBalanza == null || registrosPuertoBalanza.Count == 0) return;

                BalanzasCortes bc = new BalanzasCortes();
                var item = new registrosPuerto();
                var itemAnterior = new registrosPuerto();

                for (int i = 0; i < registrosPuertoBalanza.Count; i++)
                {
                    item = registrosPuertoBalanza[i];

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
                        itemAnterior = registrosPuertoBalanza[i - 1];
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
                throw ex;
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
            try
            {
                foreach (Carga car in cargasBalanza)
                {
                    registrosPuerto regP = new registrosPuerto();
                    var balanzadasCarga = new List<RegistroBalanzaPuerto>();
                    var balanzadas = new List<Balanzada>();
                    bool vieneError = false;

                    balanzadasCarga = Repositorio.Listar<RegistroBalanzaPuerto>(x => x.Id >= car.CargaOpuesta_Id && x.Id <= car.Id && x.NumeroBalanza == car.NumeroBalanza).OrderBy(x => x.Id).ToList();
                    balanzadas = Repositorio.Listar<Balanzada>(x => x.Id >= car.CargaOpuesta_Id && x.Id <= car.Id && x.NumeroBalanza == car.NumeroBalanza).ToList();
                    regP.numeroBalanza = car.NumeroBalanza;
                    regP.numeroCarga = car.Id;
                    regP.kilosTotalesCarga = balanzadas.Sum(x => x.PesoNeto);
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
                            regP.kilosTotalesCarga = balanzadas.Sum(x => x.PesoNeto);
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
                                regP.idFin = registro.Id;
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
            catch (Exception ex)
            {
                throw ex;
            }
            
        }


        public class registrosPuerto
        {
            public int numeroCarga { get; set; }
            public string numeroBalanza { get; set; }
            public DateTime fechaInicio { get; set; }
            public DateTime fechaFin { get; set; }

            public int kilosTotalesCarga { get; set; }

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
