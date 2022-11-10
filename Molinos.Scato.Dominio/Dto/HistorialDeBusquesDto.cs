using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class HistorialDeBusquesDto
    {
        public int EmbarqueId { get; set; }
        public int VaporId { get; set; }
        public bool EsLiquido { get; set; }
        public string NombreBuque { get; set; }
        public string NombreAta { get; set; }
        public string Destino { get; set; }
        public IEnumerable<string> MuelleCarga { get; set; }
        public IEnumerable<string> Productos { get; set; }
        public DateTime? FechaDesamarro { get; set; }
        public DateTime? FechaAmarro { get; set; }
        public IEnumerable<ProductoExportadorDto> ProductoExportador { get; set; }
        public decimal TotalRitmoBaja { get; set; }
        public decimal TotalRitmoNormal { get; set; }
        public string AgenciaControlPrivado { get; set; }
        public double HorasMuelle { get; set; }
        public int ModuloDeCargaId { get; set; }
        public int LineUpId { get; set; }
        public string HoraAmarro { get; set; }
        public string HoraDesamarro { get; set; }
        public string NombreMuelle { get; set; }
    }
    public class ProductoExportadorDto
    {
        public int Exportador_Id { get; set; }
        public string NombreExportador { get; set; }
        
        public int MaterialPuerto_Id { get; set; }
        public string NombreMaterial { get; set; }

        public decimal Toneladas { get; set; }
        
    }
}
