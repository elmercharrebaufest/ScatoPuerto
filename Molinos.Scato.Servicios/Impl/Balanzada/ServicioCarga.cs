using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ComandosEF;
using Molinos.Scato.Repositorio.ComandosEF.BalanzasPuerto;
using Molinos.Scato.Servicios.Estrategias;
using Molinos.Scato.Servicios.Orquestador;
using Ninject.Extensions.Logging;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using static Molinos.Scato.Dominio.Constantes;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioCarga : IServicioCarga
    {
        private readonly IRepositorio _repositorio;
        private readonly IServicioOrquestador _orquestador;
        protected ILogger Log { get; private set; }

        public ServicioCarga(IRepositorio repositorio, IServicioOrquestador orquestador, ILogger log)
        {
            this._repositorio = repositorio;
            this._orquestador = orquestador;
            Log = log;
        }

        public BalanzadaRecibidaDTO ConvertirDatosABalanazadaRecibida(Dictionary<string, string> datos)
        {
            var balanzadaRecibida = new BalanzadaRecibidaDTO
            {
                Id = int.Parse(datos["id"]),
                TipoBalanzada = datos["tipoBalanzada"],
                NumeroBalanza = datos["numeroBalanza"],
                Fecha = DateTime.ParseExact(datos["fecha"], "dd-MM-yyyyHH:mm", CultureInfo.InvariantCulture),
            };

            var balanza = _repositorio.Obtener<BalanzaPuerto>(q => q.CodigoBalanza == balanzadaRecibida.NumeroBalanza);

            balanzadaRecibida.CodigoDispositivo = balanza.CodigoDispositivo;
            balanzadaRecibida.OffsetBalanza = balanza.OffSetPlc;
            balanzadaRecibida.IdOffset = balanzadaRecibida.Id + balanzadaRecibida.OffsetBalanza;
            balanzadaRecibida.UltimaValidacion = balanza.UltimaValidacion;
            balanzadaRecibida.IntentosValidacion = balanza.IntentosValidacion;

            if (datos.ContainsKey("commodity"))
                balanzadaRecibida.Commodity = datos["commodity"];

            if (datos.ContainsKey("bodega"))
                balanzadaRecibida.Bodega = datos["bodega"];

            if (datos.ContainsKey("vapor"))
                balanzadaRecibida.Vapor = datos["vapor"];

            if (datos.ContainsKey("exportador"))
                balanzadaRecibida.Exportador = datos["exportador"];

            if (datos.ContainsKey("destino"))
                balanzadaRecibida.Destino = datos["destino"];

            if (datos.ContainsKey("pesoProgramado"))
                balanzadaRecibida.PesoProgramado = int.Parse(datos["pesoProgramado"]);

            if (datos.ContainsKey("toneladasaw"))
                balanzadaRecibida.ToneladasAW = int.Parse(datos["toneladasaw"]);

            if (datos.ContainsKey("pesoBruto"))
                balanzadaRecibida.PesoBruto = int.Parse(datos["pesoBruto"]);

            if (datos.ContainsKey("pesoTara"))
                balanzadaRecibida.PesoTara = int.Parse(datos["pesoTara"]);

            if (datos.ContainsKey("pesoNeto"))
                balanzadaRecibida.PesoNeto = int.Parse(datos["pesoNeto"]);

            if (datos.ContainsKey("capacidad"))
                balanzadaRecibida.Capacidad = datos["capacidad"];

            return balanzadaRecibida;
        }

        public ResultadoCrear CrearCargaPendiente(BalanzadaRecibidaDTO balanzada)
        {
            Log.Debug("Validando balanza {0} balanzada {1} {2}", balanzada.NumeroBalanza, balanzada.TipoBalanzada, balanzada.Id);
            var resultado = new ResultadoCrear();
            var ok = ValidarCrearCargaPendiente(balanzada);
            if (!ok)
            {
                resultado.Error("", "No se han podido restaurar todos los pendientes");
            }
            return resultado;
        }

        public bool ExisteRegistroBalanzaPuerto(BalanzadaRecibidaDTO balanzada)
        {
            return _repositorio.Existe<RegistroBalanzaPuerto>(e => e.Id == balanzada.IdOffset && e.NumeroBalanza == balanzada.NumeroBalanza);
        }

        private bool ValidarCrearCargaPendiente(BalanzadaRecibidaDTO balanzada)
        {
            var desde = balanzada.UltimaValidacion;
            var cuantos = balanzada.IdOffset - balanzada.UltimaValidacion;

            // Registros que ya están en la db por lo que no deben consultarse al orquestador
            var idsAExcluir = _repositorio.Listar<RegistroBalanzaPuerto, int>(x => x.Id,
                c => c.Id >= desde &&
                c.Id < balanzada.IdOffset &&
                (c.NumeroBalanza == balanzada.NumeroBalanza)
            ).OrderBy(x => x).ToList();

            idsAExcluir.Add(0); // Se añade el id 0 ya que no es un id válido en el orquestador

            List<int> balanzadasPendientes = Enumerable.Range(desde, cuantos).Except(idsAExcluir).ToList();
            Log.Debug("Faltan las siguientes balanzadas en la balanza {0}: {1}", balanzada.NumeroBalanza, string.Join(",", balanzadasPendientes));

            balanzadasPendientes = balanzadasPendientes.OrderBy(x => x).ToList();

            foreach (int balanzadaId in balanzadasPendientes)
            {
                int reintentos = 0;
                bool validado = false;
                while (reintentos < balanzada.IntentosValidacion && !validado)
                {
                    var balanzadaPendiente = _orquestador.Ejecutar(new EjecutarConsultaBalanzada { CodigoDispositivo = balanzada.CodigoDispositivo, IdBalanzada = balanzadaId - balanzada.OffsetBalanza });

                    if (balanzadaPendiente.Mensaje.Codigo == 0)
                    {
                        var valores = ObtenerValoresBalanzada(balanzadaPendiente);
                        if (valores.Any())
                        {
                            var balanzadaACrear = ConvertirDatosABalanazadaRecibida(valores);
                            switch (balanzadaACrear.TipoBalanzada)
                            {
                                case TipoBalanzada.Inicio:
                                    CrearCargaInicio(balanzadaACrear);
                                    break;

                                case TipoBalanzada.Balanzada:
                                    CrearBalanzada(balanzadaACrear);
                                    break;

                                case TipoBalanzada.Fin:
                                    CrearCargaFin(balanzadaACrear);
                                    break;

                                default:
                                    CrearRegistroBalanzaPuerto(balanzadaACrear);
                                    break;
                            }
                            validado = true;
                        }
                    }
                    reintentos++;
                }
                // Si falla los 3 reintentos se aborta
                if (!validado)
                {
                    Log.Info("No se pudo obtener la balanzada {0} de la balanza {1}", balanzadaId, balanzada.NumeroBalanza);
                    return false;
                }
            }
            return true;
        }

        private Dictionary<string, string> ObtenerValoresBalanzada(ResultadoEjecutar resultadoEjecutar)
        {
            Type type = resultadoEjecutar.GetType();
            IEnumerable props = type.GetRuntimeProperties();
            var valoresBalanzada = new Dictionary<string, string>();

            foreach (PropertyInfo prop in props)
            {
                if (string.Equals(prop.Name, "ValoresBalanzada", StringComparison.OrdinalIgnoreCase))
                {
                    valoresBalanzada = (Dictionary<string, string>)prop.GetValue(resultadoEjecutar);
                }
            }
            return valoresBalanzada;
        }

        public void ActualizarUltimaValidacion(BalanzadaRecibidaDTO balanzada)
        {
            var desde = balanzada.UltimaValidacion;
            var hasta = balanzada.IdOffset;
            var ultimaValidacion = _repositorio.EjecutarComando(new ObtenerUltimoIdValidoBalanza(desde, hasta, balanzada.NumeroBalanza));
            var balanzaPuerto = _repositorio.Obtener<BalanzaPuerto>(x => x.CodigoDispositivo == balanzada.CodigoDispositivo);
            balanzaPuerto.UltimaValidacion = ultimaValidacion;
            _repositorio.GuardarCambios();
        }

        public ResultadoCrear CrearCargaInicio(BalanzadaRecibidaDTO balanzada)
        {
            var resultado = new ResultadoCrear();
            try
            {
                if (ExisteRegistroBalanzaPuerto(balanzada))
                {
                    return resultado;
                }

                if (EsInicioFalso(balanzada))
                {
                    var registroBalanzaPuerto = ConstruirRegistroBalanzaPuerto(balanzada, TipoBalanzada.InicioError);
                    _repositorio.Agregar(registroBalanzaPuerto);
                    var inicioActualizar = ObtenerInicioActualizar(balanzada);
                    if (inicioActualizar != null)
                    {
                        inicioActualizar.PesoProgramado = balanzada.PesoProgramado;
                    }
                    _repositorio.GuardarCambios();
                }
                else
                {
                    Carga cargaFin = null;

                    bool hayRegistrosPosteriores = _repositorio.Existe<RegistroBalanzaPuerto>(r => r.Id > balanzada.IdOffset && r.NumeroBalanza == balanzada.NumeroBalanza);
                    if (hayRegistrosPosteriores)
                    {
                        cargaFin = _repositorio.EjecutarComando(new ObtenerCargaFin(balanzada.IdOffset, balanzada.NumeroBalanza));
                    }

                    var carga = ConstruirCarga(balanzada, cargaFin);
                    _repositorio.Agregar(carga);

                    if (cargaFin != null)
                    {
                        cargaFin.CargaOpuesta = carga;
                    }
                    _repositorio.GuardarCambios();

                    // Asignar balanzadas huerfanas a inicio
                    if (hayRegistrosPosteriores)
                    {
                        // Si no hay fin, se toma como fin el próximo inicio.
                        var cargaHasta = cargaFin ?? _repositorio.EjecutarComando(new ObtenerSiguienteCargaInicio(balanzada.IdOffset, balanzada.NumeroBalanza));
                        var hasta = cargaHasta?.Id ?? -1; // Si no hay un hasta, el -1 indica que se actualiza hasta la ultima balanzada.
                        var balanzadasModificadas = _repositorio.EjecutarComando(new AsignarBalanzadas(balanzada.IdOffset, balanzada.NumeroBalanza, hasta));
                    }
                }
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
            }
            return resultado;
        }

        public ResultadoCrear CrearBalanzada(BalanzadaRecibidaDTO balanzada)
        {
            var resultado = new ResultadoCrear();
            try
            {
                if (ExisteRegistroBalanzaPuerto(balanzada))
                {
                    return resultado;
                }

                var inicio = _repositorio.EjecutarComando(new ObtenerCargaInicio(balanzada.IdOffset, balanzada.NumeroBalanza));
                var ultimoIdFin = _repositorio.EjecutarComando(new ObtenerIdFinAnterior(balanzada.IdOffset, balanzada.NumeroBalanza));
                if (inicio != null && ultimoIdFin > inicio.Id)
                {
                    inicio = null;
                }

                var balanzadaEntity = ConstruirBalanzada(balanzada, inicio);
                _repositorio.Agregar(balanzadaEntity);
                _repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                throw;
            }
            return resultado;
        }

        public ResultadoCrear CrearCargaFin(BalanzadaRecibidaDTO balanzada)
        {
            var resultado = new ResultadoCrear();
            try
            {
                if (ExisteRegistroBalanzaPuerto(balanzada))
                {
                    return resultado;
                }

                var cargaInicio = _repositorio.EjecutarComando(new ObtenerCargaInicio(balanzada.IdOffset, balanzada.NumeroBalanza, true));
                var idFinAnterior = _repositorio.EjecutarComando(new ObtenerIdFinAnterior(balanzada.IdOffset, balanzada.NumeroBalanza));
                if (cargaInicio != null && idFinAnterior > cargaInicio.Id)
                {
                    cargaInicio = null;
                }

                var cargaFin = ConstruirCarga(balanzada, cargaInicio);

                if (cargaInicio != null)
                {
                    cargaFin.FechaInicio = cargaInicio.Fecha;
                    cargaInicio.CargaOpuesta = cargaFin;
                }

                _repositorio.Agregar(cargaFin);
                _repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
            }
            return resultado;
        }

        public ResultadoCrear CrearRegistroBalanzaPuerto(BalanzadaRecibidaDTO balanzada)
        {
            var resultado = new ResultadoCrear();
            try
            {
                if (ExisteRegistroBalanzaPuerto(balanzada))
                {
                    return resultado;
                }

                var registroBalanzaPuerto = ConstruirRegistroBalanzaPuerto(balanzada, balanzada.TipoBalanzada);
                _repositorio.Agregar(registroBalanzaPuerto);
                _repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
            }
            return resultado;
        }

        // Un inicio falso es aquel inicio cuyo registro anterior es un error41 o cuyo registros anteriores sean todos errores comenzando con un error41.
        // Ej1: error41 inicio. Ej2: error41 error error error inicio
        private bool EsInicioFalso(BalanzadaRecibidaDTO balanzada, int? idEspecifico = null)
        {
            var id = idEspecifico ?? balanzada.IdOffset;
            var registroAnterior = _repositorio.Obtener<RegistroBalanzaPuerto>(x => x.Id == id - 1 && x.NumeroBalanza == balanzada.NumeroBalanza);

            return registroAnterior != null && (registroAnterior.Tipo == TipoBalanzada.Error41 || (registroAnterior.Tipo == TipoBalanzada.Error && EsInicioFalso(balanzada, registroAnterior.Id)));
        }

        private Carga ObtenerInicioActualizar(BalanzadaRecibidaDTO balanzada)
        {
            var ultimoInicio = _repositorio.EjecutarComando(new ObtenerCargaInicio(balanzada.IdOffset, balanzada.NumeroBalanza));
            return ultimoInicio.CargaOpuesta == null ? ultimoInicio : null;
        }

        private Carga ConstruirCarga(BalanzadaRecibidaDTO balanzada, Carga cargaOpuesta)
        {
            var balanza = _repositorio.Obtener<BalanzaPuerto>(x => x.CodigoBalanza == balanzada.NumeroBalanza);

            var vapor = ObtenerVapor(balanzada.Vapor);
            var bodega = ObtenerBodega(balanzada.Bodega);
            var destino = ObtenerDestino(balanzada.Destino);
            var exportador = ObtenerExportador(balanzada.Exportador);

            var commodity = new MaterialPuerto();
            if (balanzada.Vapor == string.Empty && balanzada.Bodega == string.Empty && balanzada.Destino == string.Empty && balanzada.Exportador == string.Empty && balanzada.Commodity == string.Empty)
            {
                commodity = _repositorio.ObtenerMenor<MaterialPuerto, int>(e => e.Descripcion.Contains("patron"), x => x.Id);
            }
            else
            {
                commodity = ObtenerMaterial(balanzada.Commodity);
            }

            return new Carga
            {
                Id = balanzada.IdOffset,
                NumeroBalanza = balanzada.NumeroBalanza,
                Fecha = balanzada.Fecha,
                Tipo = balanzada.TipoBalanzada,
                Vapor = vapor,
                Bodega = bodega,
                Destino = destino,
                Exportador = exportador,
                Material = commodity,
                PesoProgramado = balanzada.PesoProgramado,
                ToneladasAW = balanzada.ToneladasAW,
                FechaInicio = balanzada.FechaInicio,
                CargaOpuesta = cargaOpuesta
            };
        }

        private RegistroBalanzaPuerto ConstruirRegistroBalanzaPuerto(BalanzadaRecibidaDTO balanzada, string tipoBalanzada)
        {
            return new RegistroBalanzaPuerto
            {
                EnviadoASap = false,
                Fecha = balanzada.Fecha,
                Id = balanzada.IdOffset,
                NumeroBalanza = balanzada.NumeroBalanza,
                Tipo = tipoBalanzada
            };
        }

        private Balanzada ConstruirBalanzada(BalanzadaRecibidaDTO balanzada, Carga inicio)
        {
            return new Balanzada
            {
                Id = balanzada.IdOffset,
                NumeroBalanza = balanzada.NumeroBalanza,
                Fecha = balanzada.Fecha,
                Tipo = balanzada.TipoBalanzada,
                PesoBruto = balanzada.PesoBruto,
                PesoTara = balanzada.PesoTara,
                PesoNeto = balanzada.PesoNeto,
                Capacidad = balanzada.Capacidad,
                CargaInicial = inicio
            };
        }

        private Vapor ObtenerVapor(string vapor)
        {
            if (!string.IsNullOrEmpty(vapor))
            {
                Vapor registro;

                if (vapor.Length == 15)
                {
                    registro = _repositorio.Obtener<Vapor>(v => v.Nombre.StartsWith(vapor));
                }
                else
                {
                    registro = _repositorio.Obtener<Vapor>(e => e.Nombre == vapor);
                }

                if (registro == null)
                {
                    registro = new Vapor
                    {
                        Nombre = vapor
                    };
                    _repositorio.Agregar(registro);
                    _repositorio.GuardarCambios();
                }

                return registro;
            }
            return null;
        }

        private Bodega ObtenerBodega(string bodega)
        {
            if (!string.IsNullOrEmpty(bodega))
            {
                var registro = _repositorio.Obtener<Bodega>(e => e.Nombre == bodega);

                if (registro == null)
                {
                    registro = new Bodega
                    {
                        Nombre = bodega
                    };
                    _repositorio.Agregar(registro);
                    _repositorio.GuardarCambios();
                }

                return registro;
            }
            return null;
        }

        private Destino ObtenerDestino(string destino)
        {
            if (!string.IsNullOrEmpty(destino))
            {
                var registro = _repositorio.Obtener<Destino>(e => e.Nombre == destino);
                if (registro == null)
                {
                    registro = new Destino
                    {
                        Nombre = destino
                    };
                    _repositorio.Agregar(registro);
                    _repositorio.GuardarCambios();
                }

                return registro;
            }
            return null;
        }

        private Exportador ObtenerExportador(string exportador)
        {
            if (!string.IsNullOrEmpty(exportador))
            {
                var registro = _repositorio.Obtener<Exportador>(e => e.Nombre == exportador);
                if (registro == null)
                {
                    registro = new Exportador
                    {
                        Nombre = exportador
                    };
                    _repositorio.Agregar(registro);
                    _repositorio.GuardarCambios();
                }

                return registro;
            }
            return null;
        }

        private MaterialPuerto ObtenerMaterial(string commodity)
        {
            if (!string.IsNullOrEmpty(commodity))
            {
                var registro = _repositorio.Obtener<MaterialPuerto>(e => e.Descripcion == commodity);
                if (registro == null)
                {
                    registro = new MaterialPuerto
                    {
                        Descripcion = commodity,
                        CodigoSAP = "Nuevo",
                        Almacen = null
                    };
                    _repositorio.Agregar(registro);
                    _repositorio.GuardarCambios();
                }
                return registro;
            }
            return null;
        }
    }
}