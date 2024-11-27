using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class BalanzaManualDto
    {
        public int Id { get; set; }
        public string NumeroBalanza { get; set; }
        public string FechaInicio { get; set; }
        public string HoraInicio { get; set; }
        public string FechaCorte { get; set; }
        public string HoraCorte { get; set; }
        public MaterialPuertoDto Material { get; set; }
        public BodegaDto Bodega { get; set; }
        public DestinoDto Destino { get; set; }
        public ExportadorDto Exportador { get; set; }
        public MotivosFallasBalanzaDto MotivosFallasBalanza { get; set; }
        public TurnoPuertoDto TurnoPuerto { get; set; }
        public int? Kilogramos { get; set; }
        public int? Toneladas { get; set; }
        public bool CorteManual { get; set; }
        public string Observaciones { get; set; }
        public int Correlativo { get; set; }
        public bool Recordatorio { get; set; }
    }
}
