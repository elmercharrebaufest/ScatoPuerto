using System.Collections.Generic;

namespace Molinos.Scato.Servicios.Estrategias
{
    public class BalanzadaStrategy : IBalanzadaStrategy
    {
        private readonly IServicioCarga _servicioCarga;
        private readonly IServicioTurno _servicioTurno;

        public BalanzadaStrategy(IServicioCarga servicioCarga, IServicioTurno servicioTurno)
        {
            _servicioCarga = servicioCarga;
            _servicioTurno = servicioTurno;
        }

        public string Nombre => "balanzada";

        public bool RegistrarBalanzada(Dictionary<string, string> datos)
        {
            var balanzada = _servicioCarga.ConvertirDatosABalanazadaRecibida(datos);
            var resultado = _servicioCarga.CrearCargaPendiente(balanzada);
            if (!resultado.HayErrores)
            {
                _servicioCarga.CrearBalanzada(balanzada);
            }
            _servicioCarga.ActualizarUltimaValidacion(balanzada);
            return true;
        }
    }
}