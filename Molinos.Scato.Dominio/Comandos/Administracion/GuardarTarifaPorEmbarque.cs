using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Dominio.Comandos.Administracion
{
    public class GuardarTarifaPorEmbarque : Comando
    {
        public TarifaPorEmbarqueDto Dto { get; set; }
    }
}