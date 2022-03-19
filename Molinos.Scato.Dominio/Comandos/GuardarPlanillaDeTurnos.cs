using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarPlanillaDeTurnos : Comando
    {
        public int IdModuloDeCarga { get; set; }
        public ModuloDeCargaPlanillaDeTurnosTurnosDto Dto { get; set; }
        public DateTime? Fecha { get; set; }
    }
}
