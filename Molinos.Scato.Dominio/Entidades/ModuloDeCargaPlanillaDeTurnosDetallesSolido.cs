using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ModuloDeCargaPlanillaDeTurnosDetallesSolido : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual ModuloDeCargaPlanillaDeTurnos ModuloDeCargaPlanillaDeTurnos { get; set; }
        public virtual Bodega Bodega { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual Destino Destino { get; set; }
        public virtual Exportador Exportador { get; set; }
        public virtual int Cantidad { get; set; }
        public virtual int idBalanzaCorte { get; set; }
        //  public virtual DateTime? FechaCarga { get; set; }
        public virtual BalanzaPuerto BalanzaPuerto { get; set; }
        public virtual SiloCelda SiloCelda { get; set; }
        public virtual int? Fila { get; set; }
        public virtual string HoraInicio { get; set; }
        public virtual string HoraFin { get; set; }
        public virtual bool CambioMaterial { get; set; }
        public virtual string Observaciones { get; set; }


    }
}