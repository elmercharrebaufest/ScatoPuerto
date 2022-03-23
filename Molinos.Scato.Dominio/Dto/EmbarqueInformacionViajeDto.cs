using System;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class EmbarqueInformacionViajeDto
    {
        public int Id { get; set; }
       // public EmbarqueDto Embarque { get; set; }
        public string PaisOrigen { get; set; }
        public string PuertoOrigen { get; set; }
        public string PaisDestino { get; set; }
        public string PuertoDestino { get; set; }
        public string ATD { get; set; }
        public string ATA { get; set; }
        public string ETA_Reportado { get; set; }
        public string Destino_Reportado { get; set; }
        public string Peso_Reportado { get; set; }
        public int VelocidadRecorrido { get; set; }
        public DateTime FechaRegistro { get; set; }

    }
}




