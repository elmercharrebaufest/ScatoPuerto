using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class NominacionDocumentoDto
    {
        public int Id { get; set; }
        public DocumentoDto Documento { get; set; }
        public NominacionDocumentoEstadoDto NominacionDocumentoEstado { get; set; }
        public IList<NominacionDocumentoArchivoDto> Archivos { get; set; }
        public IList<NominacionDocumentoComentarioDto> Comentarios { get; set; }
    }
}
