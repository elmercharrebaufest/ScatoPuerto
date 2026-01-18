using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarDetalleSolidoPlanillaTurno :  Comando
    {
        public int IdTurno { get; set; }
        public ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto Dto { get; set; }
        public string NombreUsuario { get; set; }
    }
}
