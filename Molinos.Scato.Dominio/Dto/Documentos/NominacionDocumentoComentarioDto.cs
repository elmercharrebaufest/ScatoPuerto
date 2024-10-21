using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class NominacionDocumentoComentarioDto
    {
        public int Id { get; set; }
        public string Usuario { get; set; }
        public string Comentario { get; set; }
        public DateTime Fecha { get; set; }
    }
}
