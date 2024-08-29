using Molinos.Scato.Servicios.Estrategias;

namespace Molinos.Scato.Servicios
{
    public interface IServicioTurno
    {
        bool CrearTurno(BalanzadaRecibidaDTO balanzada);
    }
}