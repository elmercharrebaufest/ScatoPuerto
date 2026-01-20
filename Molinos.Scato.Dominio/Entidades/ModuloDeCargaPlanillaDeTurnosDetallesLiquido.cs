using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ModuloDeCargaPlanillaDeTurnosDetallesLiquido : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual ModuloDeCargaPlanillaDeTurnos ModuloDeCargaPlanillaDeTurnos{ get; set; }
        public virtual Exportador Exportador { get; set; }
        public virtual int Linea_Id { get; set; }
        public virtual int BodegaParcel { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual string Tk { get; set; }
        public virtual double Temperatura { get; set; }
        public virtual double MedidaInicialCM { get; set; }
        public virtual double MedidaInicialMM { get; set; }
        public virtual double MedidaFinalCM { get; set; }
        public virtual double MedidaFinalMM { get; set; }
        public virtual Destino Destino { get; set; }
        public virtual decimal Cantidad { get; set; }
        public virtual string HoraInicio { get; set; }
        public virtual string HoraFin { get; set; }
        public virtual bool CambioMaterial { get; set; }
        public string Observaciones { get; set; }
        
    }
}