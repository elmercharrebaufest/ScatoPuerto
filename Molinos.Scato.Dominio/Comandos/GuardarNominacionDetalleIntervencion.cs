using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarNominacionDetalleIntervencion : Comando
    {
        public NominacionDetalleIntervencionDto Dto { get; set; }
        public int nominacion_id { get; set; }
    }
}
