using Molinos.Scato.Dominio.Dto;
using System;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarPlanillaDeEmbarque : Comando
    {
        public int IdModuloDeCarga { get; set; }
        public ModuloDeCargaPlanillaDeEmbarqueDto Dto { get; set; }
    }
}