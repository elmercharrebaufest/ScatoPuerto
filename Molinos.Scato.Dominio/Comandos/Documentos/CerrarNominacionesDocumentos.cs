using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Comandos.Documentos
{
    public class CerrarNominacionesDocumentos : Comando
    {
        public List<int> NomDocIds { get; set; }
    }
}
