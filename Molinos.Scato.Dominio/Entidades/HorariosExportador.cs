using System;

namespace Molinos.Scato.Dominio.Entidades
{
    public class HorariosExportador : IIdentificable
    {
        public virtual int Id { get; set; }
        public int ModuloDeCarga_Id { get; set; }
        public virtual DateTime? Inicio { get; set; }
        public virtual DateTime? Fin { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual Exportador Exportador { get; set; }
        public virtual PlanoDeCargaBodegaDestino PlanoDeCargaBodegaDestino { get; set; }
    }
}