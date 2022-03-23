using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class ModuloDeCargaBalanzasDto
    {
        public int Id { get; set; }
        public MotivosFallasBalanzaDto MotivosFallasBalanza { get; set; }
        public string Observaciones { get; set; }
    }
}
