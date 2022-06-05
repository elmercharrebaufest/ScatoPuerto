using Molinos.Scato.Dominio.Entidades;
using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto
    {
        public int Id { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public DestinoDto Destino { get; set; }
        public BodegaDto Bodega{ get; set; }
        public ExportadorDto Exportador { get; set; }
        
        public int Cantidad { get; set; }
     //   public virtual DateTime? FechaCarga { get; set; }
    }
}