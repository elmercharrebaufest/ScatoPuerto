using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class ComprobanteDeEmbarqueDto
    {
        public int Id { get; set; }
        public TipoComprobanteDto TipoComprobante { get; set; }
        public string TurnosRomaneo { get; set; }
        public string Buque { get; set; }
        public string NumeroComprobante { get; set; }
        public int CantidadPaginas { get; set; }
        public DateTime FechaEmision { get; set; }
        public string UsuarioEmision { get; set; }
        public DateTime? FechaImpresion { get; set; }
        public string UbicacionArchivo { get; set; }
        public string Estado { get; set; }
        public string FechaETA { get; set; }
        public bool CantidadExactaDestino { get; set; }
        public bool CantidadExactaExportador { get; set; }
        public IList<ComprobanteDeEmbarqueDetalleDto> ComprobanteDeEmbarqueDetalles { get; set; }
    }
}
