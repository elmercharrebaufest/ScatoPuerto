using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto.Administracion
{
    public class CombosConsultaProvisionesDto
    {
        public List<MuelleDeCargaDto> Muelles { get; set; }
        public List<ExportadorDto> Exportadores { get; set; }
        public List<MaterialPuertoDto> Productos { get; set; }
        public List<AcuerdoDto> Acuerdos { get; set; }
    }

    public class EmbarqueRawDto
    {
        public int Id { get; set; }
        public VaporDto Vapor { get; set; }
        public DateTime Periodo { get; set; }
    }
}