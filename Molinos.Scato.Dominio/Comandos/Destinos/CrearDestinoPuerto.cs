using Molinos.Scato.Dominio.Dto.Destino;

namespace Molinos.Scato.Dominio.Comandos
{
    public class CrearDestinoPuerto : Comando
    {
        public AltaEdicionDestinoDto Destino { get; set; }
    }
}