using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarTarifasDetallePeriodo : Comando
    {
        public GuardarTarifasDetallePeriodoDto TarifasPeriodo { get; set; }
    }
}
