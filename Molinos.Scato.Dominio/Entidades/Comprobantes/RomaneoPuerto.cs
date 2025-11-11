using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class RomaneoPuerto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual ModuloDeCarga ModuloDeCarga { get; set; }
        public virtual int NumeroRomaneo { get; set; }
        public virtual int CantidadPaginas { get; set; }
        public virtual DateTime FechaEmision { get; set; }
        public virtual string UsuarioEmision { get; set; }
        public virtual DateTime? FechaImpresion { get; set; }
        public virtual int Estado { get; set; }
        public virtual DateTime? FechaEliminacion { get; set; }
        public virtual string UsuarioEliminacion { get; set; }
        public virtual ICollection<RomaneoPuertoComprobante> RomaneoPuertoComprobantes { get; set; }
    }
}
