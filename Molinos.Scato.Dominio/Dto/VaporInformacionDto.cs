using Molinos.Scato.Dominio.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class VaporInformacionDto
    {
        public int Id { get; set; }
        public int vapor_id { get; set; }
        public int PaisPuerto_id { get; set; }
        public string nombreBuque { get; set; }
        public string tipoBuque { get; set; }
        public string categoriaBuque { get; set; }
        public string imoVapor { get; set; }
        public decimal freeboard { get; set; }
        public decimal eslora { get; set; }
        public decimal porteNeto { get; set; }
        public decimal porteBruto { get; set; }
        public decimal manga { get; set; }
        public decimal puntual { get; set; }
        public int cantidadBodegasTks { get; set; }

    }
}