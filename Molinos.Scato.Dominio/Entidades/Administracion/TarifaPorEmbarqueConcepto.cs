using Molinos.Scato.Dominio.Entidades;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Dto
{
    public class TarifaPorEmbarqueConcepto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual TarifaPorEmbarque TarifaPorEmbarque { get; set; }
        public virtual Concepto Concepto { get; set; }
        public virtual decimal Valor { get; set; }
    }
}