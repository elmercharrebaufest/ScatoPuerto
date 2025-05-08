using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class TarifaPorEmbarqueDto
    {
        public virtual int Id { get; set; }
        public virtual EmbarqueDto Embarque { get; set; }
        public virtual ExportadorDto Exportador { get; set; }
        public virtual MaterialPuertoDto MaterialPuerto { get; set; }
        public virtual DateTime Periodo { get; set; }
    }
}