using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ModuloDeCargaPeriodoDeCarga : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual ModuloDeCarga ModuloDeCarga { get; set; }
        public virtual DateTime? FechaAmarro { get; set; }
        public virtual string HoraAmarro { get; set; }
        public virtual string VientoAmarro { get; set; }
        public virtual string DireccionAmarro { get; set; }
        public virtual DateTime? FechaDesamarro { get; set; }
        public virtual string HoraDesamarro { get; set; }
        public virtual string VientoDesamarro { get; set; }
        public virtual string DireccionDesamarro { get; set; }
        public virtual DateTime? FechaHabilitacion { get; set; }
        public virtual string HoraHabilitacion { get; set; }
        public virtual DateTime? FechaConexionMangueras { get; set; }
        public virtual DateTime? FechaDesconexionMangueras { get; set; }
        public virtual DateTime? FechaComienzoCarga { get; set; }
        public virtual DateTime? FechaFinalizacionCarga { get; set; }
        public virtual string HoraConexionMangueras { get; set; }
        public virtual string HoraDesconexionMangueras { get; set; }
        public virtual string HoraComienzoCarga { get; set; }
        public virtual string HoraFinalizacionCarga { get; set; }
        public virtual DateTime? FechaHoraRada { get; set; }
        public virtual DateTime? FechaHoraPracticoABordo { get; set; }
        public virtual DateTime? FechaHoraSalioDeRada { get; set; }
        public virtual DateTime? FechaHoraPracticoSalida { get; set; }
    }
}