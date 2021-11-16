using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Orquestador;
using Molinos.Scato.Web.Helpers;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Web.ServicioHub
{
    public class ServicioSuscriptor : IServicioSuscriptor
    {
        private readonly ILogger log;
        private readonly IServicioComandos comandos;
        private readonly IServicioOrquestador servicioOrquestador;
        private readonly IServicioRepositorio servicio;
        private readonly IServicioActividadFactory<IEjecutarService> factory;
        private readonly IListaDeWorkflows workflows;

        private readonly HubClient hubClientLectura;
        private readonly HubClientNotificar hubClientNotificar;

        public ServicioSuscriptor(ILogger log, IServicioComandos comandos, IServicioActividadFactory<IEjecutarService> factory, IServicioRepositorio servicio, IServicioOrquestador servicioOrquestador, IListaDeWorkflows workflows, HubClientFactory hubClientFactory)
        {
            this.log = log;
            this.comandos = comandos;
            this.factory = factory;
            this.servicioOrquestador = servicioOrquestador;
            this.workflows = workflows;
            this.servicio = servicio;

            hubClientLectura = hubClientFactory.GetClient("notificaLectura");
            hubClientNotificar = hubClientFactory.GetClientNotificar("notificarUsuario");
        }

        public void Recibir(NotificacionEvento notificacion)
        {
            if (notificacion.CodigoEvento == "LecturaTarjetaRecibida")
            {
                try
                {
                    var lectura = notificacion.Datos["Tarjeta"].ToString(CultureInfo.InvariantCulture);
                    log.Debug("Iniciando - Notificacion de dispositivo: {0}", notificacion.CodigoDispositivo);
                    var resultado = (ResultadoActualizarLecturaDeTarjeta)comandos.Ejecutar(new ActualizarLecturaDeTarjeta { Dto = new LecturaDeTarjetaDto { Lectura = lectura, CodigoDispositivo = notificacion.CodigoDispositivo } });
                    log.Debug("Fin - Actualizando lectura para el dispositivo: {0}", notificacion.CodigoDispositivo);

                    if (!resultado.LecturaPuestosDeTrabajo.Any())
                    {
                        throw new Exception(String.Format("Fin - No se encontraron puestos de trabajo para el dispositivo: {0}", notificacion.CodigoDispositivo));
                    }

                    foreach (var lecturaPuestoDeTrabajo in resultado.LecturaPuestosDeTrabajo)
                    {
                        if (lecturaPuestoDeTrabajo.EsTarjetaSupervisor)
                        {
                            NotificarPuestoConPatentePorSignalR(notificacion, lecturaPuestoDeTrabajo);
                            EjecutarPuestoTarjetaSupervisor(lecturaPuestoDeTrabajo);
                            if (lecturaPuestoDeTrabajo.PuestoDeTrabajoImprimeTarjetaDeAcceso)
                            {
                                lecturaPuestoDeTrabajo.MensajeError = string.Format(Textos.Error_TarjetaSupervisor, lecturaPuestoDeTrabajo.NumeroDeTarjeta,
                                    lecturaPuestoDeTrabajo.PuestoDeTrabajoId, notificacion.CodigoDispositivo);
                                NotificarUsuarioErrorPorSignalR(lecturaPuestoDeTrabajo);
                            }

                            comandos.Ejecutar(new CrearLogTarjetaSupervisor { PuestoDeTrabajoId = lecturaPuestoDeTrabajo.PuestoDeTrabajoId, NumeroTarjeta = lecturaPuestoDeTrabajo.NumeroDeTarjeta });
                        }
                        else if (!lecturaPuestoDeTrabajo.PuestoDeTrabajoPidePantente && lecturaPuestoDeTrabajo.PuestoDeTrabajoImprimeTarjetaDeAcceso)
                        {
                            if (!lecturaPuestoDeTrabajo.TarjetaValida)
                            {
                                NotificarUsuarioErrorPorSignalR(lecturaPuestoDeTrabajo);
                            }
                            else
                            {
                                var resultadoImpresion = comandos.Ejecutar(new ImprimirTarjetaDeAcceso
                                {
                                    Dto = new ImpTarjetaDeAccesoDto
                                    {
                                        Codigo = "ImpresionTarjetaDeAcceso",
                                        Numero = lecturaPuestoDeTrabajo.NumeroDeTarjeta,
                                        Fecha = DateTime.Now.Formatted(),
                                        CentroId = lecturaPuestoDeTrabajo.CentroId,
                                        PuestoDeTrabajoId = lecturaPuestoDeTrabajo.PuestoDeTrabajoId
                                    }
                                });
                                if (resultadoImpresion.HayErrores)
                                {
                                    lecturaPuestoDeTrabajo.MensajeError = Textos.ErrorImpresionTarjetaDeAcceso;
                                    NotificarUsuarioErrorPorSignalR(lecturaPuestoDeTrabajo);
                                }
                                else
                                {
                                    comandos.Ejecutar(new CrearCargaDeCupo
                                    {
                                        Dto = new CargaDeCupoDto
                                        {
                                            CentroId = lecturaPuestoDeTrabajo.CentroId,
                                            PuestoDeTrabajoId = lecturaPuestoDeTrabajo.PuestoDeTrabajoId,
                                            Fecha = DateTime.Now,
                                            Numero = lecturaPuestoDeTrabajo.NumeroDeTarjeta,
                                            EstuvoPendiente = true
                                        }
                                    });
                                    EjecutarDispositivosDeEntrada(lecturaPuestoDeTrabajo);
                                }
                            }
                        }
                        else if (lecturaPuestoDeTrabajo.PuestoDeTrabajoPidePantente)
                        {
                            if (lecturaPuestoDeTrabajo.TarjetaValida && lecturaPuestoDeTrabajo.VideoCamaras.Any())
                            {
                                EjecutarDispositivosConPatente(lecturaPuestoDeTrabajo);
                            }
                            if (!lecturaPuestoDeTrabajo.TarjetaValida || (lecturaPuestoDeTrabajo.PrimerNumeroDeTarjeta == lecturaPuestoDeTrabajo.NumeroDeTarjeta))
                            {
                                NotificarPuestoConPatentePorSignalR(notificacion, lecturaPuestoDeTrabajo);
                            }
                        }
                        else
                        {
                            if (!lecturaPuestoDeTrabajo.TarjetaValida)
                            {
                                NotificarUsuarioErrorPorSignalR(lecturaPuestoDeTrabajo);
                                log.Info("Fin - La tarjeta: {0} no es valida: {1}",
                                         lecturaPuestoDeTrabajo.NumeroDeTarjeta,
                                         lecturaPuestoDeTrabajo.MensajeError);
                            }
                            else
                            {
                                EjecutarPuestoSinPatente(lecturaPuestoDeTrabajo);
                            }
                            NotificarPuestoConPatentePorSignalR(notificacion, lecturaPuestoDeTrabajo);
                        }
                    }
                }
                catch (Exception e)
                {
                    log.Error(e, "Error al enviar notificación del dispositivo: {0}", notificacion.CodigoDispositivo);
                }
            }
            else if (notificacion.CodigoEvento == "ErrorConexionDispositivo" || notificacion.CodigoEvento == "ConexionDispositivoCorrecta")
            {
                log.Debug("Iniciando - Notificacion de dispositivo: {0}", notificacion.CodigoDispositivo);

                var resultado = (ResultadoActualizarEstadoConexion)comandos.Ejecutar(new ActualizarEstadoConexion
                {
                    Dto = new EstadoConexionDto
                    {
                        Dispositivo = notificacion.CodigoDispositivo,
                        Estado = notificacion.CodigoEvento == "ConexionDispositivoCorrecta",
                        Mensaje = notificacion.CodigoEvento == "ErrorConexionDispositivo" ? Textos.ErrorConexionDispositivo : string.Empty
                    }
                });

                log.Debug("Fin - Actualizando lectura para el dispositivo: {0}", notificacion.CodigoDispositivo);

                foreach (var estado in resultado.EstadoConexionDto)
                {
                    NotificarEstadoConexionPorSignalR(notificacion, estado);
                }
            }
        }

        private void NotificarUsuarioErrorPorSignalR(LecturaPuestoDeTrabajoDto lecturaPuestoDeTrabajo, TipoAlerta tipo = TipoAlerta.Error)
        {
            var notificacionDto = new NotificacionDto
            {
                Hora = DateTime.Now,
                Grupo = lecturaPuestoDeTrabajo.CentroId + "|" + lecturaPuestoDeTrabajo.PuestoDeTrabajoId,
                Mensaje = lecturaPuestoDeTrabajo.MensajeError,
                TipoAlerta = tipo
            };
            try
            {
                log.Debug("Iniciando conexion signalR");

                comandos.Ejecutar(new CrearNotificacion { Dto = notificacionDto });

                hubClientNotificar.Invoke("Notificar", notificacionDto);

                log.Debug("Fin- Mensaje enviado a usuario: {0} exitosamente", notificacionDto.Grupo);

            }
            catch (Exception e)
            {
                log.Error(e, "Error al enviar notificación: {0}", notificacionDto.Mensaje);
            }
        }

        private void NotificarPuestoConPatentePorSignalR(NotificacionEvento notificacion, LecturaPuestoDeTrabajoDto lecturaPuestoDeTrabajo)
        {
            //Inicio la conexion con SignalR
            try
            {
                log.Debug("Iniciando conexion signalR");
                hubClientLectura.Invoke("NotificarLectura", lecturaPuestoDeTrabajo);
                log.Debug("Fin - Iniciando conexion signalR");
            }
            catch (Exception e)
            {
                log.Error(e, "Fallo la Notificacion via SignalR para: {0}", notificacion.CodigoDispositivo);
            }
        }

        private void NotificarEstadoConexionPorSignalR(NotificacionEvento notificacion, EstadoConexionDto estadoConexion)
        {
            //Inicio la conexion con SignalR
            try
            {
                log.Debug("Iniciando conexion signalR");
                hubClientLectura.Invoke("NotificarEstadoConexion", estadoConexion);
                log.Debug("Fin - Iniciando conexion signalR");
            }
            catch (Exception e)
            {
                log.Error(e, "Fallo la Notificacion via SignalR para: {0}", notificacion.CodigoDispositivo);
            }
        }

        private void EjecutarDispositivosDeEntrada(LecturaPuestoDeTrabajoDto lecturaPuestoDeTrabajo, string codigoSapCentro = "", string numeroDocumentoIngreso = "", string patente = "", string actividad = "")
        {
            log.Debug("Ejecutando dispositivos de entrada para el puesto: {0}", lecturaPuestoDeTrabajo.PuestoDeTrabajoId);
            if (lecturaPuestoDeTrabajo.VideoCamaras != null && lecturaPuestoDeTrabajo.VideoCamaras.Any())
            {
                var date = DateTime.Now;
                foreach (var videoCamara in lecturaPuestoDeTrabajo.VideoCamaras)
                {
                    try
                    {
                        log.Debug("Ejecutando Camara para el puesto: {0}", lecturaPuestoDeTrabajo.PuestoDeTrabajoId);
                        var fotoTemporal = string.IsNullOrEmpty(numeroDocumentoIngreso) && string.IsNullOrEmpty(patente);
                        var fileName = fotoTemporal ?
                                FotoCamionHelper.GenerarNombreTemporal(lecturaPuestoDeTrabajo.NumeroDeTarjeta, date)
                                : FotoCamionHelper.GenerarNombre(codigoSapCentro, numeroDocumentoIngreso, patente, actividad, date, TipoVehiculo.Camión);
                        date = date.AddSeconds(1);
                        var resultado = servicioOrquestador.Ejecutar(
                            new EjecutarTomarFoto
                            {
                                CodigoDispositivo = videoCamara.Codigo,
                                FilePath = videoCamara.Directorio,
                                SubPath = fotoTemporal ? "temp" : DateTime.Today.ToString("yyyyMMdd"),
                                FileName = fileName
                            });
                        var resultadoConPatente = resultado as ResultadoObtenerPatente;
                        if (resultadoConPatente != null)
                        {
                            lecturaPuestoDeTrabajo.PatenteLeida = resultadoConPatente.Patente;
                            lecturaPuestoDeTrabajo.OcrActivo = true;
                            var resultadoPatente = comandos.Ejecutar(
                                new ActualizarLecturaDeTarjetaPatente
                                {
                                    PuestoDeTrabajoId = lecturaPuestoDeTrabajo.PuestoDeTrabajoId,
                                    Lectura = lecturaPuestoDeTrabajo.NumeroDeTarjeta,
                                    PatenteLeida = resultadoConPatente.Patente,
                                    Patente = patente
                                });
                            if (!resultadoPatente.HayErrores)
                            {
                                lecturaPuestoDeTrabajo.ReconocimientoExitoso = ((ResultadoValidarPatente)resultadoPatente).ReconocimientoExitoso;
                            }
                            log.Debug($"Patente leída en el puesto {lecturaPuestoDeTrabajo.PuestoDeTrabajoId}({fileName}): {resultadoConPatente.Patente}, ");
                        }

                        if (resultado.Mensaje.Codigo != 0)
                        {
                            log.Error("Fallo la Apertura del dispositivo: {0}", resultado.Mensaje.Descripcion);
                        }

                    }
                    catch (Exception e)
                    {
                        log.Error(e, "Fallo la Apertura del dispositivo: {0}", lecturaPuestoDeTrabajo.Entrada);
                    }
                }
            }

            foreach (var dispositivo in lecturaPuestoDeTrabajo.Entrada)
            {
                log.Debug("Ejecutando Barrera de entrada {1} para el puesto: {0}", lecturaPuestoDeTrabajo.PuestoDeTrabajoId, dispositivo);
                var resultado = servicioOrquestador.Ejecutar(new EjecutarAperturaBarrera
                {
                    CodigoDispositivo = dispositivo

                });

                if (resultado.Mensaje.Codigo != 0)
                {
                    log.Error("Fallo la Apertura del dispositivo: {0}", resultado.Mensaje.Descripcion);
                }
            }
        }

        private void EjecutarPuestoTarjetaSupervisor(LecturaPuestoDeTrabajoDto lecturaPuestoDeTrabajo)
        {
            try
            {
                foreach (var dispositivo in lecturaPuestoDeTrabajo.DispositivosSupervisor)
                {
                    var resultado = servicioOrquestador.Ejecutar(new EjecutarAperturaBarrera
                    {
                        CodigoDispositivo = dispositivo

                    });

                    if (resultado.Mensaje.Codigo != 0)
                    {
                        log.Error("Fallo la Apertura del dispositivo: {0}", resultado.Mensaje.Descripcion);
                    }
                }

            }
            catch (Exception e)
            {
                log.Error(e, "Fallo la Apertura del dispositivo: {0}", lecturaPuestoDeTrabajo.DispositivosSupervisor);
            }
        }

        private void EjecutarDispositivosConPatente(LecturaPuestoDeTrabajoDto lecturaPuestoDeTrabajo)
        {
            try
            {
                log.Debug("Validando puesto con patente. Tarjeta: {0} Puesto: {1}",
                    lecturaPuestoDeTrabajo.NumeroDeTarjeta, lecturaPuestoDeTrabajo.PuestoDeTrabajoId);
                var recorrido = servicio.ObtenerDatosRecorridoActivo(null, new List<string> { lecturaPuestoDeTrabajo.NumeroDeTarjeta });
                var proximaActividad = new ProximaAccionDto();
                if (recorrido == null)
                {
                    recorrido = new DatosRecorridoDto
                    {
                        CentroCodigoSap = lecturaPuestoDeTrabajo.NumeroDeTarjeta
                    };
                }
                else
                {
                    proximaActividad = workflows.ObtenerWorkflowProximaAccion(recorrido.InstanciaWorkflow);
                }

                EjecutarDispositivosDeEntrada(lecturaPuestoDeTrabajo, recorrido.CentroCodigoSap,
                    recorrido.NumeroDocumentoIngreso, recorrido.Patente,
                    proximaActividad.ProximaAccion);
            }
            catch (Exception e)
            {
                log.Error(e, "Fallo la ejecucion del workflow relacionado con la tarjeta: {0}", lecturaPuestoDeTrabajo.NumeroDeTarjeta);
            }
        }

        private void EjecutarPuestoSinPatente(LecturaPuestoDeTrabajoDto lecturaPuestoDeTrabajo)
        {
            try
            {
                log.Debug("Validando puesto sin patente. Tarjeta: {0} Puesto: {1}",
                    lecturaPuestoDeTrabajo.NumeroDeTarjeta, lecturaPuestoDeTrabajo.PuestoDeTrabajoId);

                var recorrido = servicio.ObtenerDatosRecorridoActivo(null, new List<string> { lecturaPuestoDeTrabajo.NumeroDeTarjeta });
                var proximaActividad = new ProximaAccionDto();
                if (recorrido != null)
                {
                    proximaActividad = workflows.ObtenerWorkflowProximaAccion(recorrido.InstanciaWorkflow);
                }
                if (!String.IsNullOrEmpty(proximaActividad.Mensaje))
                {
                    log.Warn("Error al obtener la proxima accion: " + proximaActividad.Mensaje);
                    return;
                }

                var puestos = new List<PuestoDeTrabajoDto>
                    {
                        new PuestoDeTrabajoDto {Lectura = lecturaPuestoDeTrabajo.NumeroDeTarjeta, Id = lecturaPuestoDeTrabajo.PuestoDeTrabajoId }
                    };
                var resultado = servicio.ValidarProximaActividadPorPuestoSinPatente(recorrido, proximaActividad.ProximaAccion, puestos);

                if (recorrido != null && recorrido.AdvertirCaladoEnPlanta)
                {
                    lecturaPuestoDeTrabajo.MensajeError = string.Format(Textos.CaladoEnPlanta_Advertencia, recorrido.Patente);
                    NotificarUsuarioErrorPorSignalR(lecturaPuestoDeTrabajo, TipoAlerta.Advertencia);
                }
                if ((recorrido != null && !string.IsNullOrEmpty(resultado.NumeroDocumentoIngreso) && !string.IsNullOrEmpty(resultado.Patente)) || recorrido == null)
                {
                    EjecutarDispositivosDeEntrada(lecturaPuestoDeTrabajo, resultado.CodigoSapCentro,
                                                                      resultado.NumeroDocumentoIngreso, resultado.Patente,
                                                                      resultado.ProximaActividad);
                }


                if (resultado.Valida)
                {
                    var serviciowf = factory.CrearServicio(resultado.WorkflowDefinicionId);
                    var resultadoActividad = serviciowf.Ejecutar(resultado.InstanceId, new ControlRecorridoDto
                    {
                        WorkflowInstanceId = resultado.InstanceId,
                        NombreUsuario = String.Empty,
                        Actividad = Textos.ResourceManager.GetString("Act" + resultado.ProximaActividad) ?? resultado.ProximaActividad,
                        ActividadXaml = resultado.ProximaActividad,
                        Decision = true,
                        PuestoDeTrabajoId = resultado.PuestoDeTrabajoId
                    });
                    if (resultadoActividad != null && resultadoActividad.HayErrores)
                    {
                        log.Error("La ejecución de la actividad {0} terminó con errores: {1}",
                                resultado.ProximaActividad, resultadoActividad.Errores.First().Value);
                    }
                }
                else
                {
                    log.Warn("No se puede ejecutar el WF relacionado con la tarjeta {0}. Mensaje: {1}",
                            lecturaPuestoDeTrabajo.NumeroDeTarjeta, resultado.MensajeError);
                    lecturaPuestoDeTrabajo.TarjetaValida = false;
                    lecturaPuestoDeTrabajo.MensajeError = resultado.MensajeError;
                }
            }
            catch (Exception e)
            {
                log.Error(e, "Fallo la ejecucion del workflow relacionado con la tarjeta: {0}", lecturaPuestoDeTrabajo.NumeroDeTarjeta);
            }
        }
    }
}
