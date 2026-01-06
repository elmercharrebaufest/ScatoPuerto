using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class Acuerdo : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AcuerdoTipo AcuerdoTipo { get; set; }
        public virtual string Descripcion { get; set; }
        public virtual MuelleDeCarga MuelleDeCarga { get; set; }
        public virtual Exportador Exportador { get; set; }
        public virtual DateTime FechaInicio { get; set; }
        public virtual DateTime FechaFin { get; set; }
        public virtual DateTime? FechaEliminacion { get; set; }
        public virtual string UsuarioEliminacion { get; set; }
        public virtual string NombreArchivo { get; set; }
        public virtual string UbicacionArchivo { get; set; }
        public virtual ICollection<AcuerdoDetalle> AcuerdoDetalles { get; set; }
    }
}
