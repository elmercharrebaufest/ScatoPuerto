using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionDetalleIntervecion
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual Nominacion Nominacion { get; set; }
        public virtual short Precintado { get; set; }
        public virtual short DraftSurvey { get; set; }
        public virtual string ACuentaDe         { get; set; }
        public virtual string PermisoDeEmbarque { get; set; }
        public virtual string EstibadorYTrimado { get; set; }
        public virtual string Fumigacion { get; set; }
        public virtual CompaniaDeFumigacion CompaniaDeFumigacion { get; set; }
        public virtual TipoDeFumigacion TipoDeFumigacion { get; set; }


    }
}
