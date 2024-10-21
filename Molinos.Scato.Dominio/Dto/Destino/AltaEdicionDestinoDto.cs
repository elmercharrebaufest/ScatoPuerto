using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto.Destino
{
    public class AltaEdicionDestinoDto
    {
        public DestinoDto Destino { get; set; }
        public List<DocumentoDestinoDto> Documentos { get; set; }
    }
}