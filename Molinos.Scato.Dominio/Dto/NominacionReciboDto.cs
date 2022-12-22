using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class NominacionReciboDto
    {
        public int Id { get; set; }
        public ExportadorDto Exportador { get; set; }
        public string Formato { get; set; }
        public int Cantidad { get; set; }
        public string Unidad { get; set; }
        public string Ajuste { get; set; }
        public string PuertoDeCarga { get; set; }
        public string PuertoDeDescarga { get; set; }
        public string DescripcionesBienes { get; set; }
        public bool RecibosPorDia { get; set; }
        public bool MostrarDestinos { get; set; }
        public bool MostrarBodegas { get; set; }
    }
}
