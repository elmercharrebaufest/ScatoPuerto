using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class PlanoDeCargaBodegaDestino : IIdentificable
    {
        public virtual int Id { get; set; }
        public virtual PlanoDeCargaBodega PlanoDeCargaBodega { get; set; }
        public virtual Destino Destino { get; set; }
        public virtual decimal Cantidad { get; set; }
    }
}
