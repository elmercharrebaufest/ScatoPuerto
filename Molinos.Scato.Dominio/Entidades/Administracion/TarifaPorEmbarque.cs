using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class TarifaPorEmbarque : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual Embarque Embarque { get; set; }
        public virtual Exportador Exportador { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual DateTime Periodo { get; set; }
        public virtual ICollection<TarifaPorEmbarqueConcepto> TarifaPorEmbarqueConcepto { get; set; }
        public virtual TipoContratoTarifa TipoContratoTarifa { get; set; }
        public virtual bool Cerrado { get; set; }
    }
}