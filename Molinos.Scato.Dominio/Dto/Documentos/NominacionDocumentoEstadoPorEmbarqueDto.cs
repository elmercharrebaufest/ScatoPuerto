using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.Documentos
{
    public class NominacionDocumentoEstadoPorEmbarqueDto
    {
        public int DocumentoId { get; set; }
        public string Documento { get; set; }
        public bool EsBorradorSolicitado { get; set; }
        public bool EsBorradorEnviado { get; set; }
        public bool EsBorradorModificado { get; set; }
        public bool EsBorradorAprobado { get; set; }
        public bool EsDocumentoEnviado { get; set; }
    }
}
