using Molinos.Scato.Dominio.Dto.Administracion;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarAdministracionEmbarque : Comando
    {
        public AdministracionEmbarqueDto Dto { get; set; }
        public bool Facturar { get; set; }
        public int EmbarqueId { get; set; }
    }
}