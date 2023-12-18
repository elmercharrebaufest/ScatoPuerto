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
        public PlanoDeCargaBodega PlanoDeCargaBodega { get; set; }
        public Destino Destino { get; set; }
    }
}
