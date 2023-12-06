using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCoemMercaderiaSueltaEmbalaje : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string CodigoEmbalaje { get; set; }
        public virtual int Peso { get; set; }
        public virtual int CantidadBultos { get; set; }
        public virtual int CantidadReal { get; set; }
    }
}
