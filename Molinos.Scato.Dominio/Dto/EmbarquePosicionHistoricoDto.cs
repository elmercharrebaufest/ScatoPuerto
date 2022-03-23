using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class EmbarquePosicionHistoricoDto
    {
        public int Id { get; set; }
        public int Embarque_id { get; set; }
        public DateTime HoraUTCPosicionRecibida { get; set; }
        public DateTime HoraLocalBarco { get; set; }
        public string Area { get; set; }
        public string PuertoActual { get; set; }
        public string Latitud { get; set; }
        public string Longitud { get; set; }
        public string Estado { get; set; }
        public string VelocidadCurso { get; set; }
        public DateTime FechaRegistro { get; set; }

    }
}
