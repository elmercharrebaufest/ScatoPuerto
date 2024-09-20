using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class DocumentoDto
    {
        public int Id { get; set; }
        public DocumentoTipoDto DocumentoTipo { get; set; }
        public string Nombre { get; set; }
        public bool Activo { get; set; }
    }
}
