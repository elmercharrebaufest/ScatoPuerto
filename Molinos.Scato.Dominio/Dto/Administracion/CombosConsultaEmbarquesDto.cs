using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto.Administracion
{
    public class CombosConsultaEmbarquesDto
    {
        public List<VaporDto> Buques { get; set; }
        public List<MuelleDeCargaDto> Muelles { get; set; }
        public List<ExportadorDto> Exportadores { get; set; }
        public List<CoordinadorPuertoDto> Clientes { get; set; }
        public List<MaterialPuertoDto> Productos { get; set; }
    }
}