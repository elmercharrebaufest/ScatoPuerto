using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class ReciboDeBuqueDto
    {
        public int Id { get; set; }
        public int NumeroRecibo { get; set; }
        public string Estado { get; set; }
        public string Emitio { get; set; }
        public string Superviso { get; set; }
        public DateTime? FechaHoraImpresion { get; set; }
        public bool Habilitado { get; set; } 
        public IList<ReciboDeBuqueDetallesDto> ReciboDeBuqueDetalles { get; set; }
    }
}