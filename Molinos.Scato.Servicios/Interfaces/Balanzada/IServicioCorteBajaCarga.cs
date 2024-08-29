using Molinos.Scato.Servicios.Estrategias;

namespace Molinos.Scato.Servicios
{
    public interface IServicioCorteBajaCarga
    {
        bool CrearCorte(BalanzadaRecibidaDTO balanzada);
        bool ActualizarCorte();
    }
}