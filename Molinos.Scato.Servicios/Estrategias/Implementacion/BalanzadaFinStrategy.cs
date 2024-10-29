using System.Collections.Generic;

namespace Molinos.Scato.Servicios.Estrategias
{
    public class BalanzadaFinStrategy : IBalanzadaStrategy
    {
        private readonly IServicioCarga _servicioCarga;

        public BalanzadaFinStrategy(IServicioCarga servicioCarga)
        {
            _servicioCarga = servicioCarga;
        }

        public string Nombre => "fin";

        public bool RegistrarBalanzada(Dictionary<string, string> datos)
        {
            var balanzada = _servicioCarga.ConvertirDatosABalanazadaRecibida(datos);
            _servicioCarga.CrearCargaPendiente(balanzada);
            _servicioCarga.CrearCargaFin(balanzada);
            _servicioCarga.ActualizarUltimaValidacion(balanzada);
            return true;
        }
    }
}