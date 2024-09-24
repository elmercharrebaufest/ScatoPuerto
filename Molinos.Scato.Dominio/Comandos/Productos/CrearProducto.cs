using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Dominio.Comandos.Productos
{
    public class CrearProducto : Comando
    {
        public RegistroProductoDto Dto { get; set; }
    }
}