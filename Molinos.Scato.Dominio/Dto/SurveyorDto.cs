using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class SurveyorDto
    {
        public int Id { get; set; }
        public string Descripcion { get; set; }
        public string Mail { get; set; }
    }
}
