using Molinos.Scato.Dominio.Dto.Administracion;
using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class TarifaPorEmbarqueDto
    {
        public int Id { get; set; }
        public EmbarqueDto Embarque { get; set; }
        public ExportadorDto Exportador { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public DateTime Periodo { get; set; }
        public IList<TarifaPorEmbarqueConceptoDto> TarifaPorEmbarqueConcepto { get; set; }
        public TipoContratoTarifaDto TipoContratoTarifa { get; set; }
        public bool Cerrado { get; set; }
    }
}