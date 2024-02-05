using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipPuerto : IIdentificable
    {
        [Key]
        public int Id { get; set; }
        public string Codigo { get; set; }
        public string Descripcion { get; set; }
        public int VigenciaDesde { get; set; }
        public int VigenciaHasta { get; set; }
        public int Pais { get; set; }
        public string Aduana { get; set; }
    }
}
