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
        public IList<ModuloDeCargaPlanillaDeTurnosDetallesDto> ModuloDeCargaPlanillaDeTurnosDetalles { get; set; }
        public IList<ModuloDeCargaPlanillaDeTurnosCortesDto> ModuloDeCargaPlanillaDeTurnosCortes { get; set; }
        public IList<ModuloDeCargaPlanillaDeTurnosObservacionesDeCalidadDto> ModuloDeCargaPlanillaDeTurnosObservacionesDeCalidadDto { get; set; }
    }
}