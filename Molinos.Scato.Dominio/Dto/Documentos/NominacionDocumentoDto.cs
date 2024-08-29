using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class NominacionDocumentoDto
    {
        public int Id { get; set; }
        public DocumentoDto Documento { get; set; }
        public ClienteDto Cliente { get; set; }
        public DestinoDto Destino { get; set; }
        public NominacionDocumentoEstadoDto Estado { get; set; }
        public IList<NominacionDocumentoArchivoDto> Archivos { get; set; }
        public ICollection<NominacionDocumentoComentarioDto> Comentarios { get; set; }
        public int CantidadDeJuegos { get; set; }
    }
}
