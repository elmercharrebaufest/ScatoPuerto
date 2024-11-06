using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.Documentos
{
    public class DocumentoEnvioAlertaDto
    {
        public string Destinatarios { get; set; }
        public string Motivo { get; set; }
        public string MotivoDescripcion { get; set; }
        public string Asunto { get; set; }
        public string Comentario { get; set; }
    }
}
