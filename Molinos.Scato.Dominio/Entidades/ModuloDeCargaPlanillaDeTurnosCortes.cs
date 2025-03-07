using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ModuloDeCargaPlanillaDeTurnosCortes : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual ModuloDeCargaPlanillaDeTurnos ModuloDeCargaPlanillaDeTurnos{ get; set; }
        public virtual MotivosFallasBalanza MotivosDeCorte { get; set; }
        public virtual string HoraInicio { get; set; }
        public virtual string HoraFin { get; set; }
        public virtual string TiempoTotal { get; set; }
        public virtual string Observaciones { get; set; }
        public virtual int? idBalanzaCorte { get; set; }
        public virtual int? Cantidad { get; set; }
        public virtual TipoLineaEmbarque TipoLineaEmbarque { get; set; }
        public virtual bool Recordatorio { get; set; }
    }
}