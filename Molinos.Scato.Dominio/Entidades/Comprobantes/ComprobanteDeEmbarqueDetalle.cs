using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ComprobanteDeEmbarqueDetalle : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual ComprobanteDeEmbarque ComprobanteDeEmbarque { get; set; }
        public virtual int? NumeroComprobante { get; set; }
        public virtual string Producto { get; set; }
        public virtual string Bodega { get; set; }
        public virtual string Exportador { get; set; }
        public virtual string Destino { get; set; }
        public virtual DateTime FechaCarga { get; set; }
        public virtual int Turno { get; set; }
        public virtual int Cantidad { get; set; }
        public virtual int Balanza { get; set; }
        public virtual DateTime? FechaInicioCarga { get; set; }
        public virtual DateTime? FechaFinCarga { get; set; }
    }
}
