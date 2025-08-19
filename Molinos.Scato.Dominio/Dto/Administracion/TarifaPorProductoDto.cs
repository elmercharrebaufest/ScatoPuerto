using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class TarifaPorProductoDto
    {
        public int Id { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public DateTime Periodo { get; set; }
        public bool Cerrado { get; set; }
        public IList<TarifaPorProductoConceptoDto> TarifaPorProductoConcepto { get; set; }
    }
}