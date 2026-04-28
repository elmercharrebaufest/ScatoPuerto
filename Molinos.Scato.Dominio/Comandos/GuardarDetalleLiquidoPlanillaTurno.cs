using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarDetalleLiquidoPlanillaTurno : Comando
    {
        public int IdTurno { get; set; }
        public ModuloDeCargaPlanillaDeTurnosDetallesLiquidoDto Dto { get; set; }
        public string NombreUsuario { get; set; }
    }
}
