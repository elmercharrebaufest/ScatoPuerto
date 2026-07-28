using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class ModificarAgenciaMaritimaATADto
    {
        [Required(ErrorMessage = "El ID es obligatorio")]
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio")]
        public string Nombre { get; set; }

        [Required(ErrorMessage = "El CUIT es obligatorio")]
        [RegularExpression(@"^$|^\d{11}$", ErrorMessage = "El CUIT debe constar exactamente de 11 numeros")]
        public string Cuit { get; set; }

        [Required(ErrorMessage = "El Código SAP es obligatorio")]
        [RegularExpression(@"^\d{1,10}$", ErrorMessage = "El Código SAP debe constar de hasta 10 dígitos numéricos")]
        public string CodigoSap { get; set; }

        [Required(ErrorMessage = "El tipo es obligatorio")]
        [Range(1, 2, ErrorMessage = "El tipo no es válido")]
        public int Tipo { get; set; }
    }
}
