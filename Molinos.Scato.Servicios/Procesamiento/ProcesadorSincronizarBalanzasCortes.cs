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
        private const int TIEMPO_MINIMO_CORTE = 30;
        public ProcesadorSincronizarBalanzasCortes(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio)
            : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(SincronizarBalanzasCortes comando)
        {
            try
            {
				var lineup = Repositorio.Obtener<LineUp>(x => x.ModuloDeCarga.Id == comando.IdModuloDeCarga);
                if (lineup != null)
                {
					var embarqueBase = lineup.Embarque;

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


					ValidarBajaCarga(comando.IdModuloDeCarga, embarqueBase.Vapor.Id);

					//Genero los turnos
					ProcesarCargasPlanillaSolidos(comando.IdModuloDeCarga);
				}
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

                    if (embarque.FechaHoraInicioCarga.Value < DateTime.Now)
                    {
                        var estadoBuq = Repositorio.Obtener<EstadoBuque>(x => x.Id == 3);
                        embarque.EstadoBuque = estadoBuq;
                        Repositorio.GuardarCambios();
                    }

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
                        ModuloDeCargaPlanillaDeTurnosUltimaActualizacion moduloDeCargaPlanillaDeTurnosUltimaActualizacion = Repositorio.Obtener<ModuloDeCargaPlanillaDeTurnosUltimaActualizacion>(x => x.ModuloDeCarga.Id == IdModuloDeCarga && x.NumeroBalanza == cb.NumeroBalanza);
                        
                        if (moduloDeCargaPlanillaDeTurnosUltimaActualizacion != null)
                        {
                            if (cb.idFin > 0 && cb.idFin > moduloDeCargaPlanillaDeTurnosUltimaActualizacion.Carga_Id)
                            {
                                moduloDeCargaPlanillaDeTurnosUltimaActualizacion.Carga_Id = Convert.ToInt32(cb.idFin);
                                CrearPlanillaDeTurnos(cb, cb, IdModuloDeCarga);
                            }
                        }
                        else
                        {
                            moduloDeCargaPlanillaDeTurnosUltimaActualizacion = new ModuloDeCargaPlanillaDeTurnosUltimaActualizacion();
                            moduloDeCargaPlanillaDeTurnosUltimaActualizacion.ModuloDeCarga = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == IdModuloDeCarga);
                            moduloDeCargaPlanillaDeTurnosUltimaActualizacion.NumeroBalanza = cb.NumeroBalanza;
                            if (cb.idFin > 0)
                            {
                                moduloDeCargaPlanillaDeTurnosUltimaActualizacion.Carga_Id = Convert.ToInt32(cb.idFin);
                                CrearPlanillaDeTurnos(cb, cb, IdModuloDeCarga);
                            }
                            Repositorio.Agregar(moduloDeCargaPlanillaDeTurnosUltimaActualizacion);
                        }
                        Repositorio.GuardarCambios();
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Info("ProcesadorSincronizarBalanzasCortes: Error al generar la planilla de solido" + ex.Message);
                throw ex;
            }
        }

        public void CrearPlanillaDeTurnos(BalanzasCortes rbp, BalanzasCortes cb, int ModuloDeCargaId)
        {
            try
            {
                    //Id Turno actual
                    int idTurno = (rbp.Fecha_Inicio.Value.Hour / 6) + 1;
                    ProcesarPlanilla(cb, ModuloDeCargaId, idTurno, Convert.ToInt32(rbp.idInicio), Convert.ToInt32(rbp.idFin));
                    return;
            }
            catch (Exception ex)
            {

                throw ex;
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
                        //turno = this.ServicioRepositorio.CrearModuloDeCargaPlanillaDeTurnos(ModuloDeCargaId, cb.Fecha_Inicio.Value, idTurno);

                        //Crear turno en ModuloDeCargaPlanillaDeTurnosCortes
                        //this.ServicioRepositorio.CrearModuloDeCargaPlanillaDeTurnosCortes(turno, cb);
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



        public void ValidarBajaCarga(int idModulodeCarga, int vapor_id)
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
                    var car = Repositorio.Obtener<Carga>(x => x.Id == reg.numeroCarga && x.Vapor.Id == vapor_id);
                    double tiempo = fechasFin.Subtract(fechasInicio).TotalMinutes;
                    int kgHora = (int)((PesoTotal / tiempo) * 60);

                    BalanzasCortes bc = new BalanzasCortes
                    {
                        Fecha_Inicio = fechasInicio,
                        Fecha_Corte = fechasFin,
                        ModuloDeCarga_id = mod.Id,
                        NumeroBalanza = reg.numeroBalanza,
                        Kg = PesoTotal,
                        Tn = PesoTotal / 1000,
                        idInicio = reg.idInicio,
                        idFin = reg.idFin,
                        Bodega_id = car.Bodega == null ? 0 : car.Bodega.Id,
                        Material_id = car.Material == null ? 0 : car.Material.Id,
                        Exportador_Id = car.Exportador == null ? 0 : car.Exportador.Id,
                        Destino_Id = car.Destino == null ? 0 : car.Destino.Id,
                        CargaNormal = (kgHora / 1000) >= 950
                    };
                    cortes7.Add(bc);

                }

                foreach (var cor7 in cortes7)
                {
                    if (cor7.Kg > 0)
                        GuardarRegistroBalanzasCortes(cor7);
                }

                foreach (registrosPuerto reg in listaBalanza8)
                {
                    var fechasInicio = reg.fechaInicio;
                    var fechasFin = reg.fechaFin;
                    var PesoTotal = reg.kilosTotalesCarga;
                    var car = Repositorio.Obtener<Carga>(x => x.Id == reg.numeroCarga && x.Vapor.Id == vapor_id);
                    double tiempo = fechasFin.Subtract(fechasInicio).TotalMinutes;
                    int kgHora = (int)((PesoTotal / tiempo) * 60);

                    BalanzasCortes bc = new BalanzasCortes
                    {
                        Fecha_Inicio = fechasInicio,
                        Fecha_Corte = fechasFin,
                        ModuloDeCarga_id = mod.Id,
                        NumeroBalanza = reg.numeroBalanza,
                        Kg = PesoTotal,
                        Tn = PesoTotal / 1000,
                        idInicio = reg.idInicio,
                        idFin = reg.idFin,
                        Bodega_id = car.Bodega == null ? 0 : car.Bodega.Id,
                        Material_id = car.Material == null ? 0 : car.Material.Id,
                        Exportador_Id = car.Exportador == null ? 0 : car.Exportador.Id,
                        Destino_Id = car.Destino == null ? 0 : car.Destino.Id,
                        CargaNormal = (kgHora / 1000) >= 950
                    };
                    cortes8.Add(bc);
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

                foreach (var corte in registrosPuertoBalanza)
                {
                    //Me fijo si es un corte
                    if(corte.kilosTotalesCarga == 0)
                    {
                        bc.Fecha_Inicio = corte.fechaInicio;
                        bc.Fecha_Corte = corte.fechaFin;
                        bc.ModuloDeCarga_id = idModulodeCarga;
                        bc.NumeroBalanza = corte.numeroBalanza;
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

                if (item.Count() == 0)
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
            bool huboFin = false;
            //Recorro todas las cargas
            registrosPuerto regP_carga = new registrosPuerto();
            registrosPuerto regP_corte = new registrosPuerto();
            foreach (Carga car in cargasBalanza)
            {
                //Obtengo todos los RegistrosBalanzaPuerto de esa carga
                var balanzadasCarga = new List<RegistroBalanzaPuerto>();
                balanzadasCarga = Repositorio.Listar<RegistroBalanzaPuerto>(x => x.Id >= car.CargaOpuesta_Id && x.Id <= car.Id && x.NumeroBalanza == car.NumeroBalanza).OrderBy(x => x.Id).ToList();

                //Obtengo todas las balanzadas de esa carga
                var balanzadas = new List<Balanzada>();
                balanzadas = Repositorio.Listar<Balanzada>(x => x.Id >= car.CargaOpuesta_Id && x.Id <= car.Id && x.NumeroBalanza == car.NumeroBalanza).ToList();

                
                double tiempo;
                foreach (RegistroBalanzaPuerto registro in balanzadasCarga)
                {
                    switch (registro.Tipo)
                    {
                        //Si es un inicio, inicializo todo el objeto.
                        case "inicio":
                            if (huboFin && regP_carga.numeroBalanza == registro.NumeroBalanza)
                            {
                                //si vengo de un fin me fijo el tiempo desde el fin al inicio para generar el corte.
                                tiempo = registro.Fecha.Subtract(regP_carga.fechaFin).TotalMinutes;
                                if(tiempo >= TIEMPO_MINIMO_CORTE)
                                {
                                    //Creo un corte
                                    if (regP_carga.numeroBalanza == "7")
                                    {
                                        listaBalanza7.Add(new registrosPuerto()
                                        {
                                            fechaInicio = regP_carga.fechaFin,
                                            fechaFin = registro.Fecha,
                                            numeroBalanza = regP_carga.numeroBalanza,
                                            numeroCarga = regP_carga.numeroCarga,
                                            idInicio = regP_carga.idInicio,
                                            idFin = regP_carga.idFin,
                                        });
                                    }
                                    else
                                    {
                                        listaBalanza8.Add(new registrosPuerto()
                                        {
                                            fechaInicio = regP_carga.fechaFin,
                                            fechaFin = registro.Fecha,
                                            numeroBalanza = regP_carga.numeroBalanza,
                                            numeroCarga = regP_carga.numeroCarga,
                                            idInicio = regP_carga.idInicio,
                                            idFin = regP_carga.idFin,
                                        });
                                    }
                                }
                            }
                            regP_carga.fechaInicio = registro.Fecha;
                            regP_carga.fechaFin = registro.Fecha;
                            regP_carga.idInicio = registro.Id;
                            regP_carga.idFin = registro.Id;
                            regP_carga.numeroBalanza= registro.NumeroBalanza;
                            regP_carga.numeroCarga = car.Id;
                            break;

                        case "balanzada":
                            tiempo = registro.Fecha.Subtract(regP_carga.fechaFin).TotalMinutes;
                            if(tiempo >= TIEMPO_MINIMO_CORTE)
                            {
                                //Agrego el intervalo a la lista de balanza que corresponda
                                if (regP_carga.numeroBalanza == "7")
                                {
                                    regP_carga.kilosTotalesCarga = balanzadas.Where(x => x.Id >= regP_carga.idInicio && x.Id <= regP_carga.idFin && x.NumeroBalanza == "7").Sum(x => x.PesoNeto);
                                    listaBalanza7.Add(new registrosPuerto()
                                    {
                                        fechaInicio = regP_carga.fechaInicio,
                                        fechaFin = regP_carga.fechaFin,
                                        idFin = regP_carga.idFin,
                                        idInicio = regP_carga.idInicio,
                                        kilosTotalesCarga = regP_carga.kilosTotalesCarga,
                                        numeroBalanza = regP_carga.numeroBalanza,
                                        numeroCarga = regP_carga.numeroCarga
                                    });
                                }
                                else
                                {
                                    regP_carga.kilosTotalesCarga = balanzadas.Where(x => x.Id >= regP_carga.idInicio && x.Id <= regP_carga.idFin && x.NumeroBalanza == "8").Sum(x => x.PesoNeto);
                                    listaBalanza8.Add(new registrosPuerto()
                                    {
                                        fechaInicio = regP_carga.fechaInicio,
                                        fechaFin = regP_carga.fechaFin,
                                        idFin = regP_carga.idFin,
                                        idInicio = regP_carga.idInicio,
                                        kilosTotalesCarga = regP_carga.kilosTotalesCarga,
                                        numeroBalanza = regP_carga.numeroBalanza,
                                        numeroCarga = regP_carga.numeroCarga
                                    });
                                }

                                //Agrego el corte
                                regP_corte.fechaInicio = regP_carga.fechaFin;
                                regP_corte.fechaFin = registro.Fecha;
                                regP_corte.numeroBalanza = registro.NumeroBalanza;
                                regP_corte.numeroCarga = car.Id;
                                if (regP_corte.numeroBalanza == "7")
                                {
                                    listaBalanza7.Add(new registrosPuerto()
                                    {
                                        fechaInicio = regP_corte.fechaInicio,
                                        fechaFin = regP_corte.fechaFin,
                                        idFin = regP_corte.idFin,
                                        idInicio = regP_corte.idInicio,
                                        kilosTotalesCarga = regP_corte.kilosTotalesCarga,
                                        numeroBalanza = regP_corte.numeroBalanza,
                                        numeroCarga = regP_corte.numeroCarga
                                    });
                                }
                                else { 
                                    listaBalanza8.Add(new registrosPuerto()
                                    {
                                        fechaInicio = regP_corte.fechaInicio,
                                        fechaFin = regP_corte.fechaFin,
                                        idFin = regP_corte.idFin,
                                        idInicio = regP_corte.idInicio,
                                        kilosTotalesCarga = regP_corte.kilosTotalesCarga,
                                        numeroBalanza = regP_corte.numeroBalanza,
                                        numeroCarga = regP_corte.numeroCarga
                                    });
                                }
                                regP_carga = new registrosPuerto();
                                regP_carga.fechaInicio = registro.Fecha;
                                regP_carga.fechaFin = registro.Fecha;
                                regP_carga.idInicio = registro.Id;
                                regP_carga.idFin = registro.Id;
                                regP_carga.numeroBalanza = registro.NumeroBalanza;
                                regP_carga.numeroCarga = car.Id;
                            } else
                            {
                                regP_carga.fechaFin = registro.Fecha;
                                regP_carga.idFin = registro.Id;
                            } 
                            break;

                        case "fin":
                            huboFin = true;
                            //Agrego el intervalo a la lista de balanza que corresponda
                            if (regP_carga.numeroBalanza == "7")
                            {
                                regP_carga.kilosTotalesCarga = balanzadas.Where(x => x.Id >= regP_carga.idInicio && x.Id <= regP_carga.idFin && x.NumeroBalanza == "7").Sum(x => x.PesoNeto);
                                listaBalanza7.Add(new registrosPuerto()
                                {
                                    fechaInicio = regP_carga.fechaInicio,
                                    fechaFin = regP_carga.fechaFin,
                                    idFin = regP_carga.idFin,
                                    idInicio = regP_carga.idInicio,
                                    kilosTotalesCarga = regP_carga.kilosTotalesCarga,
                                    numeroBalanza = regP_carga.numeroBalanza,
                                    numeroCarga = regP_carga.numeroCarga
                                });
                            }
                            else
                            {
                                regP_carga.kilosTotalesCarga = balanzadas.Where(x => x.Id >= regP_carga.idInicio && x.Id <= regP_carga.idFin && x.NumeroBalanza == "8").Sum(x => x.PesoNeto);
                                listaBalanza8.Add(new registrosPuerto()
                                {
                                    fechaInicio = regP_carga.fechaInicio,
                                    fechaFin = regP_carga.fechaFin,
                                    idFin = regP_carga.idFin,
                                    idInicio = regP_carga.idInicio,
                                    kilosTotalesCarga = regP_carga.kilosTotalesCarga,
                                    numeroBalanza = regP_carga.numeroBalanza,
                                    numeroCarga = regP_carga.numeroCarga
                                });
                            }                        
                            break;
                    }
                }

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
