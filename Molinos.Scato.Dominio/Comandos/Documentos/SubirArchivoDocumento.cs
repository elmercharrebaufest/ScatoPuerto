using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Molinos.Scato.Dominio.Comandos
{
    public class SubirArchivoDocumento : Comando
    {
        public int NominacionDocumentoId { get; set; }
        public List<ArchivoDto> Archivos { get; set; }
    }
}
