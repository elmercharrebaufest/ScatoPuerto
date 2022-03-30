using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaPlanillaDeTurnosDto
    {
        public int Id { get; set; }
        public DateTime? Fecha { get; set; }
        public TurnoPuertoDto TurnoPuerto { get; set; }
        public bool Cerrado { get; set; }
        public bool Enviado { get; set; }
        public virtual bool EsLiquido { get; set; }
        public IList<ModuloDeCargaPlanillaDeTurnosDetallesLiquidoDto> ModuloDeCargaPlanillaDeTurnosDetallesLiquido { get; set; }
        public IList<ModuloDeCargaPlanillaDeTurnosCortesLiquidoDto> ModuloDeCargaPlanillaDeTurnosCortesLiquido { get; set; }
        //public ObservacionesDeCalidadDto ObservacionesDeCalidadDto { get; set; }
    }
}