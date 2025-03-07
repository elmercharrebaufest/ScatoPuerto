using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarPlanillaCargaManualSolidos : Comando
    {
        public List<ModuloDeCargaPlanillaDeTurnosDto> Turnos { get; set; }
        public int IdModuloDeCarga { get; set; }
        public bool DesdeHistorial { get; set; }
        public string ObservacionPlanilla { get; set; }
    }
}
