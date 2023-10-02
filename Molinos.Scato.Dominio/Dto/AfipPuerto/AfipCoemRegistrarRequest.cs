using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.AfipPuerto
{
    public class AfipCoemRegistrarRequest
    {
        [Required(ErrorMessage = "El identificador caratula es obligatorio.")]
        public string IdentificadorCaratula { get; set; }
        [Required(ErrorMessage = "Las mercaderias son obligatorias.")]
        public IList<AfipCoemMercaderiaSueltaDto> MercaderiasSueltas { get; set; }
        public IList<AfipCoemContenedorVacioDto> ContenedoresVacios { get; set; }
        public IList<AfipCoemContenedorConCargaDto> ContenedoresConCarga { get; set; }
    }
}
