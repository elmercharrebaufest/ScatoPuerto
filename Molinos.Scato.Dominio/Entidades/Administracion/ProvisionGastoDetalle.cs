using Molinos.Scato.Dominio.Dto;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ProvisionGastoDetalle : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }

        public virtual TarifaPorEmbarqueConcepto TarifaPorEmbarqueConcepto { get; set; }
        public virtual ProvisionGasto ProvisionGasto { get; set; }
        public virtual decimal ValorCalculado { get; set; }
        public virtual decimal ValorAjustado { get; set; }
    }
}