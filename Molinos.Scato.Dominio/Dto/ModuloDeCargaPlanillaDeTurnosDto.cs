using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaPlanillaDeTurnosDto
    {
        public int Id { get; set; }
        public DateTime? Fecha { get; set; }
        public string FechaTurno { get; set; }
        public TurnoPuertoDto TurnoPuerto { get; set; }
        public bool Cerrado { get; set; }
        public bool Enviado { get; set; }
        public bool GuardadoPorTablerista { get; set; }
        public bool GuardadoPorRecibidor { get; set; }
        public bool EsLiquido { get; set; }
		public virtual DateTime? FechaCierreTurno { get; set; }

		public IList<ModuloDeCargaPlanillaDeTurnosDetallesLiquidoDto> ModuloDeCargaPlanillaDeTurnosDetallesLiquido { get; set; }
        public IList<ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto> ModuloDeCargaPlanillaDeTurnosDetallesSolido { get; set; }
        public IList<ModuloDeCargaPlanillaDeTurnosCortesDto> ModuloDeCargaPlanillaDeTurnosCortes { get; set; }
        public IList<ModuloDeCargaPlanillaDeTurnosObservacionesDeCalidadDto> ModuloDeCargaPlanillaDeTurnosObservacionesDeCalidad { get; set; }
        //public ObservacionesDeCalidadDto ObservacionesDeCalidadDto { get; set; }
        public IList<ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedadDto> ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad { get; set; }
    }
}
