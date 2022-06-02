using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ReciboDeBuqueDetalles : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual ReciboDeBuque ReciboDeBuque { get; set; }
        public virtual string Exportador { get; set; }
        public virtual string Cantidad { get; set; }
        public virtual string PuertoDestino { get; set; }
        public virtual string FechaRecibo { get; set; }
        public virtual string PuertoOrigen { get; set; }
        public virtual string NombreBuque { get; set; }
        public virtual string CantidadLetrasYClaseCarga { get; set; }
        public virtual string EstibadoEnBodega { get; set; }
        public virtual string CantidadYCalidadDesconocida { get; set; }
        public virtual string IncluirImpresionDestino { get; set; }
        public virtual string IncluirImpresionCalidad { get; set; }
        public virtual string IncluirImpresionEstibado { get; set; }


    }
}