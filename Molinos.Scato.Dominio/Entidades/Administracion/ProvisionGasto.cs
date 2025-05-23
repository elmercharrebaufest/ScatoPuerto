using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ProvisionGasto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }

        public virtual DateTime? FechaCierre { get; set; }
        public virtual string UsuarioCierre { get; set; }
        public virtual TarifaPorEmbarque TarifaPorEmbarque { get; set; }
        public virtual ICollection<ProvisionGastoDetalle> ProvisionGastoDetalle { get; set; }
    }
}