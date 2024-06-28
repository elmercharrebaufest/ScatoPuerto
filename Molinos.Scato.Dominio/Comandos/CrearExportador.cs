using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Filtros;

namespace Molinos.Scato.Dominio.Comandos
{
    [LoguearEntidad(true)]
    public class CrearExportador : Comando
    {
        public ExportadorDto Dto { get; set; }
    }
}
