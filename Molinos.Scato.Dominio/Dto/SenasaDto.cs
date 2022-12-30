using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class SenasaDto
    {
        public int Id { get; set; }      
        public ExportadorDto Exportador { get; set; }
        public DestinoDto Destino { get; set; }
        public bool TieneSenasa { get; set; }
        public string Consumo { get; set; }
        public string ACuentaDe { get; set; }
        public bool IP { get; set; }
        public bool GMO { get; set; }
        public bool FITO { get; set; }
        public bool MuestraOficial { get; set; }
        public bool CertificadoInocuidad { get; set; }
        public bool CertificadoVeterinario { get; set; }
        public string Observaciones { get; set; }
    }
}
