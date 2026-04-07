using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class LineaPorMuelle
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual MuelleDeCarga MuelleDeCarga { get; set; }
        public virtual TipoLineaEmbarque TipoLineaEmbarque { get; set; }
    }
}
