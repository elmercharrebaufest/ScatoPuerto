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
                
                int embarque = Repositorio.Obtener<LineUp>(x => x.ModuloDeCarga.Id == comando.IdModuloDeCarga).Embarque.Id;

                int vapor_id = Repositorio.Obtener<Embarque>(x => x.Id == embarque).Vapor.Id;
                IList<Carga> cargasBalanza;
                var ultimoRegistro = Repositorio.Listar<BalanzasCortes>(x => x.ModuloDeCarga_id == comando.IdModuloDeCarga).LastOrDefault();

                if (ultimoRegistro != null)
                    cargasBalanza = Repositorio.Listar<Carga>(x => x.Vapor.Id == vapor_id && x.ToneladasAW != 0 && x.CargaOpuesta_Id > 0 && x.FechaInicio > ultimoRegistro.Fecha_Corte && x.FechaInicio >= embarqueBase.FechaHoraInicioCarga);
                else
                    cargasBalanza = Repositorio.Listar<Carga>(x => x.Vapor.Id == vapor_id && x.ToneladasAW != 0 && x.CargaOpuesta_Id > 0 && x.FechaInicio >= embarqueBase.FechaHoraInicioCarga);


               


                ObtenerBalanzadasCargas(cargasBalanza);

                ValidarCargasRegistroBalanzasCortes7(comando.IdModuloDeCarga);
                ValidarCargasRegistroBalanzasCortes8(comando.IdModuloDeCarga);

                ValidarBajaCarga(comando.IdModuloDeCarga, cargasBalanza);

              //  ProcesarCargasPlanillaSolidos(vapor_id, comando.IdModuloDeCarga, embarqueBase.FechaHoraInicioCarga);

            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        public void ProcesarCargasPlanillaSolidos(int vapor_id, int IdModuloDeCarga, DateTime? fechaInicio)
        {
            try
            {
                int horaInicio = 0;
                int horaFin = 0;

                var moduloCarga = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == IdModuloDeCarga);
                var planillasTurnos = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnos>(x => x.ModuloDeCarga.Id == IdModuloDeCarga);

                var planillaturnosdetalle = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnosDetallesSolido>(x => x.ModuloDeCargaPlanillaDeTurnos.ModuloDeCarga.Id == IdModuloDeCarga).LastOrDefault();
                IList<Carga> cargaPlanillaSolido = new List<Carga>();

                if (planillaturnosdetalle == null)
                {
                    cargaPlanillaSolido = Repositorio.Listar<Carga>(x => vapor_id == x.Vapor.Id && x.FechaInicio> fechaInicio && x.CargaOpuesta_Id > 0 && x.ToneladasAW != 0);

                }
                else
                {
                    cargaPlanillaSolido = Repositorio.Listar<Carga>(x => vapor_id == x.Vapor.Id && x.FechaInicio > fechaInicio && x.CargaOpuesta_Id > 0 && x.ToneladasAW != 0 && x.FechaInicio > planillaturnosdetalle.FechaCarga);
                }

                foreach (var cargaSolido in cargaPlanillaSolido)
                {
                    #region Obtengo el turno segun la fecha
                    var turnos = Repositorio.Listar<TurnoPuerto>();
                    var turnoPlanilla = new TurnoPuerto();

                    foreach (var item in turnos)
                    {
                        var horas = item.Nombre.Split('-');

                        horaInicio = Convert.ToInt32(horas[0]);
                        horaFin = Convert.ToInt32(horas[1]);

                        if (cargaSolido.FechaInicio.Value.Hour >= horaInicio && cargaSolido.FechaInicio.Value.Hour <= horaFin)
                        {
                            turnoPlanilla = item;
                        }
                    }

                    #endregion


                    var planilla = planillasTurnos.Where(x => x.Fecha.Value.ToShortDateString() == cargaSolido.Fecha.ToShortDateString() && x.TurnoPuerto == turnoPlanilla).FirstOrDefault();

                    if (planilla == null)
                    {
                        planilla = new ModuloDeCargaPlanillaDeTurnos
                        {
                            ModuloDeCarga = moduloCarga,
                            EsLiquido = false,
                            Fecha = fechaInicio,
                            Enviado = false,
                            Cerrado = false,
                            TurnoPuerto = turnoPlanilla

                        };
                        Repositorio.Agregar(planilla);
                        Repositorio.GuardarCambios();
                    }

                    ModuloDeCargaPlanillaDeTurnosDetallesSolido moduloSolido = new ModuloDeCargaPlanillaDeTurnosDetallesSolido
                    {
                        //int Id { get; set; }
                        ModuloDeCargaPlanillaDeTurnos = planilla,
                        BodegaParcel = cargaSolido.Bodega.Id,
                        MaterialPuerto = cargaSolido.Material,
                        Destino = cargaSolido.Destino,
                        Exportador = cargaSolido.Exportador,
                        Cantidad = cargaSolido.ToneladasAW,
                        FechaCarga = cargaSolido.FechaInicio
                    };
                    Repositorio.Agregar(moduloSolido);

                }
                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                Log.Info("ProcesadorSincronizarBalanzasCortes: Error al generar la planilla de solido" + ex.Message);
                throw ex;
            }
        }

    
        public void ValidarBajaCarga(int idModulodeCarga, IList<Carga> cargasBalanza)
        {

            try
            {

                ModuloDeCarga mod = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == idModulodeCarga);

                foreach (Carga car in cargasBalanza)
                {
                    registrosPuerto regP = new registrosPuerto();
                    var balanzadas = new List<Balanzada>();

                    balanzadas = Repositorio.Listar<Balanzada>(x => x.Id > car.CargaOpuesta_Id && x.Id < car.Id && x.NumeroBalanza == car.NumeroBalanza).ToList();

                    var fin = Repositorio.Obtener<RegistroBalanzaPuerto>(x => x.Id == car.Id && x.NumeroBalanza == car.NumeroBalanza);
                    var ini = Repositorio.Obtener<RegistroBalanzaPuerto>(x => x.Id == car.CargaOpuesta_Id && x.NumeroBalanza == car.NumeroBalanza);

                    if (ini == null || fin == null)
                        return;


                    var fechasFin = (DateTime)fin.Fecha;
                    var fechasInicio = (DateTime)ini.Fecha;

                    var PesoTotal = (int)Repositorio.Sumar<Balanzada>(x => x.PesoNeto, x => x.Id >= car.CargaOpuesta_Id && x.Id <= car.Id && x.NumeroBalanza == car.NumeroBalanza);


                    double tiempo = fechasFin.Subtract(fechasInicio).TotalMinutes;

                    int kgHora = (int)((PesoTotal / tiempo) * 60);

                    if ((kgHora / 1000) < 950)
                    {
                        BalanzasCortes bc = new BalanzasCortes
                        {
                            Fecha_Inicio = fechasInicio,
                            Fecha_Corte = fechasFin,
                            ModuloDeCarga_id = mod.Id,
                            NumeroBalanza = car.NumeroBalanza,
                            Kg = kgHora,
                            Tn = kgHora / 1000,
                            Bodega_id = car.Bodega == null ? 0 : car.Bodega.Id,
                            Material_id = car.Material == null ? 0 : car.Material.Id,
                        };

                        GuardarRegistroBalanzasCortes(bc);

                    }

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
                ModuloDeCarga mod = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == idModulodeCarga);

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
                                bc.ModuloDeCarga_id = mod.Id;
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
                        bc.ModuloDeCarga_id = mod.Id;
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
                ModuloDeCarga mod = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == idModulodeCarga);

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
                                bc.ModuloDeCarga_id = mod.Id;
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
                        bc.ModuloDeCarga_id = mod.Id;
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
                Repositorio.Agregar(itemGuardar);
                Repositorio.GuardarCambios();

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


                balanzadasCarga = Repositorio.Listar<RegistroBalanzaPuerto>(x => x.Id >= car.CargaOpuesta_Id && x.Id <= car.Id && x.NumeroBalanza == car.NumeroBalanza).OrderBy(x => x.Id).ToList();

                regP.numeroBalanza = car.NumeroBalanza;
                regP.numeroCarga = car.Id;
                regP.fechaError = new List<Dictionary<DateTime, DateTime>>();
                DateTime fechaSiguiente = new DateTime();
                DateTime fechaError = new DateTime();
                foreach (RegistroBalanzaPuerto registro in balanzadasCarga)
                {
                    switch (registro.Tipo)
                    {
                        case "inicio":
                            regP.fechaInicio = registro.Fecha;
                            break;

                        case "fin":
                            regP.fechaFin = registro.Fecha;
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
                            Dictionary<DateTime, DateTime> reg = new Dictionary<DateTime, DateTime>();
                            reg.Add(fechaError, fechaSiguiente);
                            regP.fechaError.Add(reg);
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

            public List<Dictionary<DateTime, DateTime>> fechaError { get; set; }

        }

        protected override void Validar(SincronizarBalanzasCortes comando, Resultado resultado)
        {

        }


    }
}