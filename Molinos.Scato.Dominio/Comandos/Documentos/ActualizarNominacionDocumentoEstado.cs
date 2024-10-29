using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Comandos
{
    public class ActualizarNominacionDocumentoEstado : Comando
    {
        public int NomDocId { get; set; }
        public int EstadoId { get; set; }
    }
}
