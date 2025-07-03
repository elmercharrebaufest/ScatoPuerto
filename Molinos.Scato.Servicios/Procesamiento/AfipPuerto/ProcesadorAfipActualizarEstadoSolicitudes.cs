using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.AFIPServicioConsultaComunicacionEmbarque;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Molinos.Scato.Servicios.Impl;
using Newtonsoft.Json;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorAfipActualizarEstadoSolicitudes : ProcesadorComando<AfipActualizarEstadoSolicitudes>
    {
        private IConsultaComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;
        public ProcesadorAfipActualizarEstadoSolicitudes(IRepositorio repositorio, IConversor conversor, ILogger log, IConsultaComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        private static int ObtenerEstado(string estadoRespuesta)
        {
            switch (estadoRespuesta)
            {
                case "INICIADA": return (int)EstadosSolicitudesAFIP.Pendiente;
                case "APROBADA": return (int)EstadosSolicitudesAFIP.Aceptado;
                case "RECHAZADA": return (int)EstadosSolicitudesAFIP.Rechazado;
                default: throw new ArgumentException($"Estado desconocido: {estadoRespuesta}");
            }
        }

        public override Resultado Ejecutar(AfipActualizarEstadoSolicitudes comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var caratula = Repositorio.Obtener<AfipCaratula>(comando.Id);
                var res = comunicacionEmbarqueServicioHelper.ConsultarSolicitudes(caratula.IdentificadorCaratula);

                if (res.Errores.Count() > 0)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                    foreach (var e in res.Errores) { sb.AppendLine(e.Descripcion); }
                    throw new Exception(sb.ToString());
                }

                foreach (var item in res.Resultado.Listado)
                {
                    object solicitud = ObtenerObjetoSolicitud(caratula, item, out string operacion);

                    if (solicitud == null)
                    {
                        continue;
                    }

                    var tipo = solicitud.GetType();

                    var idEstadoDb = (int)tipo.GetProperty("Estado").GetValue(solicitud);
                    var idEstadoRespuesta = ObtenerEstado(item.Estado);

                    if (idEstadoRespuesta == idEstadoDb || idEstadoRespuesta == (int)EstadosSolicitudesAFIP.Pendiente)
                    {
                        continue;
                    }

                    tipo.GetProperty("Estado").SetValue(solicitud, idEstadoRespuesta);
                    tipo.GetProperty("FechaActualizacion").SetValue(solicitud, DateTime.Now);

                    if (idEstadoRespuesta == (int)EstadosSolicitudesAFIP.Aceptado)
                    {
                        EfectuaSolicitud(caratula, solicitud, operacion);
                    }

                    operacion = (idEstadoRespuesta == (int)EstadosSolicitudesAFIP.Aceptado ? "Efectuar" : "Rechazar") + operacion;
                    var json = JsonConvert.SerializeObject(solicitud, new JsonSerializerSettings { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

                    var logABM = new LogABM
                    {
                        Pantalla = operacion,
                        Usuario = "Sistema",
                        Fecha = DateTime.Now,
                        Evento = Dominio.Enums.EventoABM.Modificacion,
                        Entidad = json,
                        ClaseId = comando.Id
                    };
                    Repositorio.Agregar(logABM);
                }
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al actualizar estado de solicitudes para caratula con ID {0} {1}", comando.Id, e);
            }
            return resultado;
        }

        private object ObtenerObjetoSolicitud(AfipCaratula caratula, ConsultaSolicitudes item, out string operacion)
        {
            object solicitud;

            switch (item.TipoSolicitud)
            {
                case "No Abordo":
                    solicitud = Repositorio.Obtener<AfipSolicitudNoABordo>(s => s.IdentificadorSolicitud == item.NumeroSolicitud);
                    operacion = "SolicitudNoABordo";
                    break;
                case "Cambio de Buque":
                    solicitud = caratula.SolicitudesCambioBuque.FirstOrDefault(s => s.Estado == 0);
                    operacion = "SolicitudCambioBuque";
                    break;
                case "Rectificacion Fechas":
                    solicitud = caratula.SolicitudesCambioFechas.FirstOrDefault(s => s.Estado == 0);
                    operacion = "SolicitudCambioFechas";
                    break;
                case "Cierre Carga":
                case "Cierre Carga No Acondicionada":
                    solicitud = caratula.SolicitudesCierreCarga.FirstOrDefault(s => s.Estado == 0);
                    operacion = "SolicitudCierreCarga";
                    break;
                default:
                    throw new Exception("No se ha podido procesar el tipo de solicitud " + item.TipoSolicitud);
            }

            return solicitud;
        }

        private void EfectuaSolicitud(AfipCaratula caratula, object solicitud, string operacion)
        {
            if (operacion == "SolicitudNoABordo")
            {
                var obj = (AfipSolicitudNoABordo)solicitud;
                var declaraciones = obj.AfipSolicitudNoABordoDeclaraciones.Select(x => x.AfipCoemMercaderiaSuelta).ToList();
                foreach (var declaracion in declaraciones)
                {
                    declaracion.NoABordo = true;
                }
            }
            else if (operacion == "SolicitudCambioBuque")
            {
                var obj = (AfipSolicitudCambioBuque)solicitud;
                caratula.IdentificadorBuque = obj.IdentificadorBuque;
                caratula.NombreMedioTransporte = obj.NombreMedioTransporte;
            }
            else if (operacion == "SolicitudCambioFechas")
            {
                var obj = (AfipSolicitudCambioFechas)solicitud;
                caratula.FechaArribo = obj.FechaArribo;
                caratula.FechaZarpada = obj.FechaZarpada;
            }
            else if (operacion == "SolicitudCierreCarga")
            {
                var estadoCoem = Repositorio.Obtener<AfipCoemEstado>(x => x.Codigo == "CODE") ?? throw new Exception("No existe el estado 'CODE' en la base de datos");
                var estadosExcluidos = new List<string>() { "ANU", "REC" };
                var coems = caratula.Coems.Where(c => !estadosExcluidos.Contains(c.AfipCoemEstado.Codigo));
                foreach (var coem in coems)
                {
                    coem.AfipCoemEstado = estadoCoem;
                }
                caratula.Estado = EstadosCaratulaAFIP.Code;
            }
        }


    }
}
