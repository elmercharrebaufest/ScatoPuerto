using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AcuerdoCombosDto
    {
        public List<AcuerdoTipoDto> Tipos { get; set; }
        public List<MuelleDeCargaDto> MuellesDeCarga { get; set; }
        public List<ExportadorDto> Exportadores { get; set; }
        public List<MaterialPuertoDto> MaterialesPuerto { get; set; }
        public List<AcuerdoTipoConfiguracionDto> Configuraciones { get; set; }
        public int IdSanBenito { get; set; }
        public int IdMOA { get; set; }
    }
}
