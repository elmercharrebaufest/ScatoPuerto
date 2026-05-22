using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GenerarRomaneoPuerto : Comando
    {
        public int ModuloDeCargaId { get; set; }
        public DateTime? Fecha { get; set; }
        public int? Turno { get; set; }
    }
}
