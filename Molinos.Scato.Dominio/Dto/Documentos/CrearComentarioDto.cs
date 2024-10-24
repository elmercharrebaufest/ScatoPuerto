using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class CrearComentarioDto
    {
        public int NominacionDocumentoId { get; set; }
        public string Comentario { get; set; }
    }
}
