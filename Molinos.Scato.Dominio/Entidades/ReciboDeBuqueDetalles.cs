using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace Molinos.Scato.Dominio.Entidades
{
    public class ReciboDeBuqueDetalles : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual ReciboDeBuque ReciboDeBuque { get; set; }
        public virtual string Exportador { get; set; }
        public virtual decimal Cantidad { get; set; }
        public virtual string PuertoDestino { get; set; }
        public virtual DateTime FechaRecibo { get; set; }
        public virtual string PuertoOrigen { get; set; }
        public virtual string NombreBuque { get; set; }
        public virtual string CantidadLetrasYClaseCarga { get; set; }
        public virtual string EstibadoEnBodega { get; set; }
        public virtual string CalidadYCantidadDesconocida { get; set; }
        public virtual bool IncluirImpresionDestino { get; set; }
        public virtual bool IncluirImpresionCalidad { get; set; }
        public virtual bool IncluirImpresionEstibado { get; set; }
        public virtual bool esEuropeo { get; set; }
        public virtual bool valorEnKG { get; set; }


    }
}