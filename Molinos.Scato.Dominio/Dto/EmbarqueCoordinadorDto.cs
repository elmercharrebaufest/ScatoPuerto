using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class EmbarqueCoordinadorDto
    {
        public int Id { get; set; }
        public CoordinadorPuertoDto CoordinadorPuerto { get; set; }        
    }
}
