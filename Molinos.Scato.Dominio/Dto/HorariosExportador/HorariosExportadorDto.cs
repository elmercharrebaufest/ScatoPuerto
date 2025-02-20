using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class HorariosExportadorDto
    {
        public int Id { get; set; }
        public int ModuloDeCarga_Id { get; set; }
        public DateTime? Inicio { get; set; }
        public DateTime? Fin { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public ExportadorDto Exportador { get; set; }
        public virtual DestinoDto Destino { get; set; }
        public virtual int? BodegaParcel { get; set; }
        public int Cantidad { get; set; }
        public string Tiempo { get; set; }
    }
}