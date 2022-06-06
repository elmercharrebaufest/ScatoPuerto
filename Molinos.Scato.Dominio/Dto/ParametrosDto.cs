using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class ParametrosDto
    {
        public int Id { get; set; }
        public string Descripcion { get; set; }
        public bool Activo { get; set; }
        public bool Parametro1 { get; set; }
        public int Parametro2 { get; set; }
        public string Parametro3 { get; set; }
    }
}
