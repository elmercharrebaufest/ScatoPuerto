using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarNirManual : Comando
    {
        public int IdModuloDeCarga { get; set; }
        public List<ModuloDeCargaNirManualPuertoDto> Dto { get; set; }
    }
}
