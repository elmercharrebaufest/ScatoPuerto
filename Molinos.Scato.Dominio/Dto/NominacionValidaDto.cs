using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class NominacionValidaDto
    {
        public int Id { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public VaporInformacionDto VaporInformacion { get; set; }
        public MuelleDeCargaDto MuelleDeCarga { get; set; }
    }
}
