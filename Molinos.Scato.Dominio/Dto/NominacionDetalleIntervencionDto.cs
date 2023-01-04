using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class NominacionDetalleIntervencionDto
    {
        public int Id { get; set; }
        public bool Precintado { get; set; }
        public string PrecintadoACuentaDe { get; set; }
        public bool DraftSurvey { get; set; }
        public string SurveyACuentaDe { get; set; }
        public bool PermisoDeEmbarque { get; set; }
        public bool EstibadorYTrimado { get; set; }
        public string Fumigacion { get; set; }
        public CompaniaDeFumigacionDto CompaniaDeFumigacion { get; set; }
        public string CompaniaACuentaDe { get; set; }
        public string Observaciones { get; set; }
        public TipoDeFumigacionDto TipoDeFumigacion { get; set; }

        public ICollection<SenasaDto> Senasa { get; set; }
    }
}
