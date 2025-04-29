using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AdministracionEmbarque : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual EstadoEmbarque Estado { get; set; }
        public virtual decimal NetoTonnage { get; set; }
        public virtual DateTime? AmarroMuelleProp { get; set; }
        public virtual DateTime? DesamarroMuelleProp { get; set; }
        public virtual string MuelleProp { get; set; }
        public virtual ICollection<AdministracionEmbarqueAgencia> Agencias { get; set; }
        public virtual ICollection<AdministracionEmbarqueExportador> Exportadores { get; set; }
        public virtual DateTime? FechaFacturado { get; set; }
    }
}