using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class ReciboDeBuqueDto
    {
        public int Id { get; set; }
        public int NumeroRecibo { get; set; }
        public string Estado { get; set; }
        public string Usuario { get; set; }
        public DateTime? UltimaActualizacion { get; set; }
    }
}