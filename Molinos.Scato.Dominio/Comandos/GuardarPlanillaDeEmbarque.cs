using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarPlanillaDeEmbarque : Comando
    {
        public int IdModuloDeCarga { get; set; }
        public List<ModuloDeCargaPlanillaDeEmbarqueDto> Dto { get; set; }
        public string nombreUsuario { get; set; }
    }
}