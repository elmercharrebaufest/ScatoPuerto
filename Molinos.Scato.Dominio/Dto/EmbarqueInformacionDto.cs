using Molinos.Scato.Dominio.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class EmbarqueInformacionDto
    {
        public int Id { get; set; }
     //   public EmbarqueDto EmbarqueId { get; set; }
        public  string IMO { get; set; }
        public  string MMSI { get; set; }
        public  string Bandera { get; set; }
        public int Tonelaje { get; set; }
        public int TonelajePesoMuerto { get; set; }
        public string LargoxAnchoExtremo { get; set; }
        public string FotoEmbarque { get; set; }
        public DateTime FechaRegistro { get; set; }

    }
}