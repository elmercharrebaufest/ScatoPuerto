using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class RomaneoPuertoComprobanteDto
    {
        public int Id { get; set; }
        public string NumeroComprobante { get; set; }
        public string Producto { get; set; }
        public string Exportador { get; set; }
        public string Bodega { get; set; }
        public string Buque { get; set; }
        public string Destino { get; set; }
        public DateTime FechaCarga { get; set; }
        public int Turno { get; set; }
        public string Cantidad { get; set; }
        public string Balanza { get; set; }
    }
}
