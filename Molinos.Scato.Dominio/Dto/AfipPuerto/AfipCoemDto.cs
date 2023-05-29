using Molinos.Scato.Dominio.Dto.AfipPuerto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipCoemDto
    {
        public virtual int Id { get; set; }
        public string IdentificadorCOEM { get; set; }
        public string IdentificadorCaratula { get; set; }
        public IList<AfipCoemContenedorConCargaDto> ContenedoresConCarga { get; set; }
        public IList<AfipCoemContenedorVacioDto> ContenedoresVacios { get; set; }
        public IList<AfipCoemMercaderiaSueltaDto> MercaderiasSueltas { get; set; }
        public AfipCoemEstadoDto AfipCoemEstado { get; set; }
        public DateTime FechaRegistro { get; set; }

    }
}
