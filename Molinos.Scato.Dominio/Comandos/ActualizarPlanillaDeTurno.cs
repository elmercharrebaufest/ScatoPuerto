
namespace Molinos.Scato.Dominio.Comandos
{
    public class ActualizarPlanillaDeTurno : Comando
    {
        public int IdPlanillaDeTurno { get; set; }
        public bool Cerrado { get; set; }
    }
}
