using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class DatosRecorridoDto
    {
        public Guid InstanciaWorkflow { get; set; }
        public string TarjetaDeAcceso { get; set; }
        public string Patente { get; set; }
        public int WorkflowDefinicionId { get; set; }
        public string NumeroDocumentoIngreso { get; set; }
        public string CentroCodigoSap { get; set; }
        public int WorkflowId { get; set; }

        public int Id { get; set; }
        public bool AdvertirCaladoEnPlanta { get; set; }
    }
}
