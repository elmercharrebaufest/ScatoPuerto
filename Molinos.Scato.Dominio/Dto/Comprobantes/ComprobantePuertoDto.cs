using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class ComprobantePuertoDto
    {
        public int Id { get; set; }
        public string TipoComprobante { get; set; }
        public string Numero { get; set; }
        public int CantidadPaginas { get; set; }
        public DateTime FechaEmision { get; set; }
        public string UsuarioEmision { get; set; }
        public DateTime? FechaImpresion { get; set; }
        public string Estado { get; set; }
        public IList<RomaneoPuertoComprobanteDto> RomaneoPuertoComprobantes { get; set; }
        public IList<object> SecuenciasReales { get; set; }
    }
}
