using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class ReciboDeBuqueDtoDetallesDto
    {
        public int Id { get; set; }
        public string Exportador { get; set; }
        public string Cantidad { get; set; }
        public string PuertoDestino { get; set; }
        public string FechaRecibo { get; set; }
        public string PuertoOrigen { get; set; }
        public string NombreBuque { get; set; }
        public string CantidadLetrasYClaseCarga { get; set; }
        public string EstibadoEnBodega { get; set; }
        public string CantidadYCalidadDesconocida { get; set; }
        public string IncluirImpresionDestino { get; set; }
        public string IncluirImpresionCalidad { get; set; }
        public string IncluirImpresionEstibado { get; set; }
    }
}