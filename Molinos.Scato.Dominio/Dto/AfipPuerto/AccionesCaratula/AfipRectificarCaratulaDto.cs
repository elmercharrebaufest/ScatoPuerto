using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipRectificarCaratulaDto : AfipRegistrarCaratulaDto
    {
        [Required(ErrorMessage = "El Id de la caratula es obligatorio")]
        public override int Id { get; set; }
    }
}
