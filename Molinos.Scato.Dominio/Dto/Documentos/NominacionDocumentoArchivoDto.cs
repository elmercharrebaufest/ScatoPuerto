using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class NominacionDocumentoArchivoDto
    {
        public int Id { get; set; }
        public string Usuario { get; set; }
        public string Ubicacion { get; set; }
        public DateTime FechaSubida { get; set; }
    }
}
