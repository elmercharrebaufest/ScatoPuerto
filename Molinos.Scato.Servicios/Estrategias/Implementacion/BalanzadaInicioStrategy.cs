using System.Collections.Generic;

namespace Molinos.Scato.Servicios.Estrategias
{
    public class BalanzadaInicioStrategy : IBalanzadaStrategy
    {
        private readonly IServicioCarga _servicioCarga;

        public BalanzadaInicioStrategy(IServicioCarga servicioCarga)
        {
            _servicioCarga = servicioCarga;
        }

        public string Nombre => "inicio";

        public bool RegistrarBalanzada(Dictionary<string, string> datos)
        {
            var balanzada = _servicioCarga.ConvertirDatosABalanazadaRecibida(datos);
            _servicioCarga.CrearCargaPendiente(balanzada);
            _servicioCarga.CrearCargaInicio(balanzada);
            _servicioCarga.ActualizarUltimaValidacion(balanzada);
            return true;
        }
    }
}