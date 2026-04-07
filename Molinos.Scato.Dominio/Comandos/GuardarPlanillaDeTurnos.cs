using Molinos.Scato.Dominio.Dto;
using System;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarPlanillaDeTurnos : Comando
    {
        public int IdModuloDeCarga { get; set; }
        public bool Enviado { get; set; }
        public ModuloDeCargaPlanillaDeTurnosDto Dto { get; set; }
        public DateTime? Fecha { get; set; }
        public string nombreUsuario { get; set; }
        public bool DesdeRecibidores { get; set; }
        public bool DesdeVicentinNouryon { get; set; }
    }
}