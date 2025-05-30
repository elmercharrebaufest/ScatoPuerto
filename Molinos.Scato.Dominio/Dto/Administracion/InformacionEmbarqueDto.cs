using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto.Administracion
{
    public class InformacionEmbarqueDto
    {
        public int IdEmbarque { get; set; }
        public string Buque { get; set; }
        public string NroOperacion { get; set; }
        public string Estado { get; set; }
        public bool EsLiquido { get; set; }
        public IList<ProductoEmbarqueDto> ItemsEmbarque { get; set; }
    }

    public class ProductoEmbarqueDto
    {
        public string Producto { get; set; }
        public decimal Tn { get; set; }
        public DateTime? Amarre { get; set; }
        public DateTime? Desamarre { get; set; }
        public string Muelle { get; set; }
        public string Exportador { get; set; }
        public string Cliente { get; set; }
        public string Tanque { get; set; }
        public string Fumigacion { get; set; }
        public string Senasa { get; set; }
        public string DefMoviles { get; set; }
    }
}