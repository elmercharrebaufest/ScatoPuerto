using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaPeriodoDeCargaNuevoDto
    {
        public int Id { get; set; }
        public DateTime? FechaHoraRada { get; set; }
        public DateTime? FechaHoraPracticoABordo { get; set; }
        public DateTime? FechaHoraSalioDeRada { get; set; }
        public DateTime? FechaHoraAmarro { get; set; }
        public string VientoAmarro { get; set; }
        public string DireccionAmarro { get; set; }
        public DateTime? FechaHoraHabilitacion { get; set; }
        public DateTime? FechaHoraConexionMangueras { get; set; }
        public DateTime? FechaHoraComienzoCarga { get; set; }
        public DateTime? FechaHoraDesconexionMangueras { get; set; }
        public DateTime? FechaHoraFinalizacionCarga { get; set; }
        public DateTime? FechaHoraPracticoSalida { get; set; }
        public DateTime? FechaHoraDesamarro { get; set; }
        public string VientoDesamarro { get; set; }
        public string DireccionDesamarro { get; set; }
    }
}