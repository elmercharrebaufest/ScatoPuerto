using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class TipoLineaEmbarqueDto : ICloneable
    {

        public virtual int Id { get; set; }
        public virtual string Linea { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }

    }
}
