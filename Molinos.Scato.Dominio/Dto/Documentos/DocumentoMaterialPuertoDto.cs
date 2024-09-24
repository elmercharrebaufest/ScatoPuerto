using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class DocumentoMaterialPuertoDto
    {
        public int Id { get; set; }
        public DocumentoDto Documento { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public bool Activo { get;set; }
    }
}
