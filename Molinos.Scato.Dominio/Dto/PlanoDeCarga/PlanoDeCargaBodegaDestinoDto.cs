using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class PlanoDeCargaBodegaDestinoDto
    {
        public int Id { get; set; }
        public DestinoDto Destino { get; set; }
    }
}
