using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class DocumentoDestinoDto
    {
        public int Id { get; set; }
        public DocumentoDto Documento { get; set; }
        public DestinoDto Destino { get; set; }
    }
}
