using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionDetalleIntervencion : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual bool Precintado { get; set; }
        public virtual string PrecintadoACuentaDe { get; set; }
        public virtual bool DraftSurvey { get; set; }
        public virtual string SurveyACuentaDe { get; set; }
        public virtual bool PermisoDeEmbarque { get; set; }
        public virtual bool EstibadorYTrimado { get; set; }
        public virtual string Fumigacion { get; set; }
        public virtual CompaniaDeFumigacion CompaniaDeFumigacion { get; set; }
        public virtual string ACuentaDe { get; set; }
        public virtual string Observaciones { get; set; }
        public virtual TipoDeFumigacion TipoDeFumigacion { get; set; }
    }
}
