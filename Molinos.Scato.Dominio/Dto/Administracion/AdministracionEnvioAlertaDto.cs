using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AdministracionEnvioAlertaDto
    {
        public List<string> Destinatarios { get; set; }
        public List<string> Copia { get; set; }
        public string Motivo{ get; set;}
        public string Asunto { get; set; }
        public string Comentario { get; set; }
        public string Buque { get; set; }
    }
}
