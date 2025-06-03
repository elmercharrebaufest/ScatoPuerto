using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades.Administracion;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class TarifaPorProducto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual DateTime Periodo { get; set; }
        public virtual bool Cerrado { get; set; }
        public virtual ICollection<TarifaPorProductoConcepto> TarifaPorProductoConcepto { get; set;}
    }
}