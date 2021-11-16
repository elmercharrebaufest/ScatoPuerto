using System;

namespace Molinos.Scato.Dominio.Comandos
{
    public class EnviarMensajeCarteLed : Comando
    {
        public string Mensaje { get; set; }
        public string Codigo { get; set; }
        public int PuestoDeTrabajoId { get; set; }
    }
}
