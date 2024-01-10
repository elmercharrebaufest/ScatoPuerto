using Molinos.Scato.Dominio.Entidades;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class PlanoDeCargaBodegaHistoricoDto
    {
        public int Id { get; set; }
        public int BodegaParcel { get; set; }
        public decimal Cantidad { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public string Condicion { get; set; }
        public string SfFull { get; set; }
        public DestinoDto Destino { get; set; }
        public string TanqueDeAbordo { get; set; }
        public IList<PlanoDeCargaBodegaDestinoHistoricoDto> PlanoDeCargaBodegaDestinoHistorico { get; set; }
    }
}
