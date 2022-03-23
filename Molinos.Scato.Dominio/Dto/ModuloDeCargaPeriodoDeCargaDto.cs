using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaPeriodoDeCargaDto
    {
        public int Id { get; set; }
        public DateTime? FechaAmarro { get; set; }
        public string HoraAmarro { get; set; }
        public string VientoAmarro { get; set; }
        public string DireccionAmarro { get; set; }
        public DateTime? FechaDesamarro { get; set; }
        public string HoraDesamarro { get; set; }
        public string VientoDesamarro { get; set; }
        public string DireccionDesamarro { get; set; }
        public DateTime? FechaHabilitacion { get; set; }
        public string HoraHabilitacion { get; set; }
        public DateTime? FechaConexionMangueras { get; set; }
        public DateTime? FechaDesconexionMangueras { get; set; }
        public DateTime? FechaComienzoCarga { get; set; }
        public DateTime? FechaFinalizacionCarga { get; set; }
        public string HoraConexionMangueras { get; set; }
        public string HoraDesconexionMangueras { get; set; }
        public string HoraComienzoCarga { get; set; }
        public string HoraFinalizacionCarga { get; set; }
    }
}