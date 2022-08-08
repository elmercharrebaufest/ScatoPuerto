using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace Molinos.Scato.Dominio.Dto
{
    public class ReciboDeBuqueDetallesDto
    {
        public int Id { get; set; }
        public string Exportador { get; set; }
        public decimal Cantidad { get; set; }
        public string PuertoDestino { get; set; }
        public DateTime FechaRecibo { get; set; }
        public string PuertoOrigen { get; set; }
        public string NombreBuque { get; set; }
        public string CantidadLetrasYClaseCarga { get; set; }
        public string EstibadoEnBodega { get; set; }
        public string CalidadYCantidadDesconocida { get; set; }
        public bool IncluirImpresionDestino { get; set; }
        public bool IncluirImpresionCalidad { get; set; }
        public bool IncluirImpresionEstibado { get; set; }
        public bool esEuropeo { get; set; }
        public bool valorEnKG { get; set; }
    }
}