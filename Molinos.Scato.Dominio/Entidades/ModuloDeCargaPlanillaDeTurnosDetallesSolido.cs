using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ModuloDeCargaPlanillaDeTurnosDetallesSolido : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual ModuloDeCargaPlanillaDeTurnos ModuloDeCargaPlanillaDeTurnos{ get; set; }
        public virtual Bodega Bodega { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual Destino Destino { get; set; }
        public virtual Exportador Exportador { get; set; }
        public virtual decimal Cantidad { get; set; }
    }
}