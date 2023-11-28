using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipLugarOperativoDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; }
        public string Descripcion { get; set; }
        public int VigenciaDesde { get; set; }
        public int VigenciaHasta { get; set; }
        public string Pais { get; set; }
        public int Aduana { get; set; }
    }
}
