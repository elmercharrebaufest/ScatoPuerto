using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class PlanoDeCargaBodegaHistorico : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int BodegaParcel { get; set; }
        public virtual decimal Cantidad { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual string Condicion { get; set; }
        public virtual string SfFull { get; set; }
        public virtual Destino Destino { get; set; }
        public virtual PlanoDeCargaHistorico PlanoDeCargaHistorico { get; set; }
        public virtual string TanqueDeAbordo { get; set; }
        public virtual ICollection<PlanoDeCargaBodegaDestinoHistorico> PlanoDeCargaBodegaDestinoHistorico { get; set; }
    }
}