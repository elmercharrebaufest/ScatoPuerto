using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarAcuerdo : Comando
    {
        public AcuerdoDto Acuerdo { get; set; }
        public ArchivoDto Archivo { get; set; }
        public bool EliminarArchivo { get; set; }
    }
}
