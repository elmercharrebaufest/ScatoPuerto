using System;
using System.Globalization;
using System.Linq;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Servicios.Orquestador;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioSuscriptor : IServicioSuscriptor
    {
        private readonly IServicioComandos servicioComandos;
        private readonly ILogger log;
        private readonly IServicioRepositorio repositorio;

        public ServicioSuscriptor(IServicioComandos servicioComandos, ILogger log, IServicioRepositorio repositorio)
        {
            this.servicioComandos = servicioComandos;
            this.log = log;
            this.repositorio = repositorio;
        }

        public void Recibir(NotificacionEvento notificacion)
        {
            log.Debug("Notificacion recibida: {0}", notificacion);
            try
            {
                switch (notificacion.CodigoEvento)
                {
                    case "EntradaActivada":
                        var resultadoApertura = servicioComandos.Ejecutar(new CrearMotivoQuiebreBarrera { CodigoDispositivo = notificacion.CodigoDispositivo, Apertura = true });
                        EnviarMail(Textos.MailQuiebreBarrera, resultadoApertura, notificacion);
                        break;
                    case "EntradaDesactivada":
                        var resultadoCierre = servicioComandos.Ejecutar(new CrearMotivoQuiebreBarrera { CodigoDispositivo = notificacion.CodigoDispositivo, Apertura = false });
                        EnviarMail(Textos.MailCierreBarrera, resultadoCierre, notificacion);
                        break;
                    case "BalanzadaRecibida":
                        if (notificacion.Datos["tipoBalanzada"] == "fin")
                        {
                            servicioComandos.Ejecutar(new ValidarConsistenciaBalanzadas { Balanza = notificacion.CodigoDispositivo, CodigoDispositivo = notificacion.CodigoDispositivo, Hasta = Int32.Parse(notificacion.Datos["id"]) });
                        }

                        servicioComandos.Ejecutar(new CrearLecturaBalanzada { CodigoDispositivo = notificacion.CodigoDispositivo, Informacion = notificacion.Datos });
                        break;
                }
            }
            catch (Exception e)
            {
                log.Error(e, "No se pudo procesar la notificacion");
                throw;
            }
            log.Debug("Notificacion procesada con exito");
        }

        private void EnviarMail(string cuerpo, Resultado resultadoApertura, NotificacionEvento notificacion)
        {
            if (!resultadoApertura.HayErrores)
            {
                var ultimosMovimientos = repositorio.ObtenerUltimosMovimientosDispositivo(notificacion.CodigoDispositivo);
                var ultMovString = "";

                foreach (MotivoQuiebreBarreraDto motivo in ultimosMovimientos)
                {
                    ultMovString += (motivo.Apertura == true ? "Quiebre " : "Cierre ") + motivo.Fecha + motivo.Hora + "<br/>";
                }

                var usuariosApertura = repositorio.ObtenerUsuariosQuiebreApertura();
                var resultado = resultadoApertura as ResultadoMotivoQuiebre;
                byte[] foto = null;
                if (resultado.Fotos.Any())
                {
                    foto = repositorio.ObtenerFotoPorQuiebreDeBarrera(resultado.Fotos.First(), DateTime.Now);
                }
                servicioComandos.Ejecutar(new EnvioMail { Destinatarios = usuariosApertura, Titulo = "Quiebre de Barrera", Cuerpo = string.Format(cuerpo, notificacion.CodigoDispositivo, DateTime.Now, notificacion.CodigoDispositivo, ultMovString, Convert.ToBase64String(foto)) });
            }
        }
    }
}
