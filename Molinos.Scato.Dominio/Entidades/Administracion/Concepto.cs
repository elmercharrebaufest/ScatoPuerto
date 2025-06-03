using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class Concepto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Descripcion { get; set; }
        public virtual TipoConcepto TipoConcepto { get; set; }
        public virtual Moneda Moneda { get; set; }
        public virtual TipoTarifa TipoTarifa { get; set; }
        public virtual bool PresentaAjuste { get; set; }
        public virtual bool PorProducto { get; set; }
        public virtual bool PorEmbarque { get; set; }
    }
}