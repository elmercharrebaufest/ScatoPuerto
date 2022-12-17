using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionRecibo : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual Nominacion Nominacion { get; set; }
        public virtual Exportador Exportador { get; set; }
        public virtual string Formato { get; set; }
        public virtual int Cantidad { get; set; }
        public virtual string Unidad { get; set; }
        public virtual string Ajuste { get; set; }
        public virtual string PuertoDeCarga { get; set; }
        public virtual string PuertoDeDescarga { get; set; }
        public virtual string DescripcionesBienes { get; set; }
        public virtual bool RecibosPorDia { get; set; }
        public virtual bool MostrarDestinos { get; set; }
        public virtual bool MostrarBodegas { get; set; }

    }
}
