using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class FiltrosAdministracionDto
    {
        public int Pagina { get; set; }
        public int ItemsPorPagina { get; set; }
        public DateTime? Desamarre { get; set; }
        public List<VaporDto> Buques { get; set; }
        public List<MuelleDeCargaDto> Muelles { get; set; }
        public string Tanques { get; set; }
        public List<ExportadorDto> Exportadores { get; set; }
        public List<CoordinadorPuertoDto> Clientes { get; set; }
        public List<MaterialPuertoDto> Materiales { get; set; }
        public string Estados { get; set; }
    }
}