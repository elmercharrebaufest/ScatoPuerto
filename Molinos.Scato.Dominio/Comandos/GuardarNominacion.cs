using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarNominacion : Comando
    {
        public NominacionDto Dto { get; set; }
        public bool EsCreacion { get; set; }
        public bool EsModificacionDatoTecnico { get; set; }
        public bool EsModificacionIntervenciones { get; set; }
        public bool EsModificacionRecibos { get; set; }

        
    }
}
