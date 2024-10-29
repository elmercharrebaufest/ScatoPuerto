using System;

namespace Molinos.Scato.Dominio.Dto
{
	public class RitmoDeCargasBalanzasDto
    {
        public decimal RitmoCargaBruto { get; set; }
        public decimal LLevasCargando { get; set; }
        public decimal RitmoCargaNeto { get; set; }
        public DateTime ArrancoBalanza7 { get; set; }
        public DateTime UltimaBalanzada7 { get; set; }
        public decimal CargaBalanza7 { get; set; }
        public decimal RitmoBalanza7 { get; set; }
        public DateTime UltimaActualizacionBalanza7 { get; set; }
		public DateTime ArrancoBalanza8 { get; set; }
		public DateTime UltimaBalanzada8 { get; set; }
		public decimal CargaBalanza8 { get; set; }
        public decimal RitmoBalanza8 { get; set; }
        public DateTime UltimaActualizacionBalanza8 { get; set; }
    }
}
