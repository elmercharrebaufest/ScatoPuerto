using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Dominio.Comandos.Exportador
{
    public class CrearExportadorPuerto : Comando
    {
        public ExportadorDto Dto { get; set; }
    }
}