using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.AfipPuerto
{
    public class AfipCoemRectificarRequest
    {
        [Required(ErrorMessage = "El Id es obligatorio")]
        public int Id { get; set; }
        public string IdentificadorCOEM { get; set; }
        public string IdentificadorCaratula { get; set; }
        public IList<AfipCoemContenedorConCargaDto> ContenedoresConCarga { get; set; }
        public IList<AfipCoemContenedorVacioDto> ContenedoresVacios { get; set; }
        [Required(ErrorMessage = "Las mercaderias son obligatorias")]
        public IList<AfipCoemMercaderiaSueltaDto> MercaderiasSueltas { get; set; }
    }
}
