using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
    [Table("BalanzasCortes")]
    public class BalanzasCortes : IIdentificable
    {
        [Key, Column(Order = 0)]
        public virtual int Id { get; set; }
        public virtual string NumeroBalanza { get; set; }
        public virtual int ModuloDeCarga_id { get; set; }
        public virtual int? MotivosFallasBalanza_id { get; set; }
        public virtual string Observaciones { get; set; }
        public virtual DateTime? Fecha_Inicio { get; set; }
        public virtual DateTime? Fecha_Corte { get; set; }
        public virtual int? Bodega_id { get; set; }
        public virtual int? Material_id { get; set; }
        public virtual int? Kg { get; set; }
        public virtual int? Tn { get; set; }
        public virtual bool Cerrado { get; set; }
        public virtual bool CorteManual { get; set; }
        public virtual int? Exportador_Id { get; set; }
        public virtual int? Destino_Id { get; set; }
        public virtual bool? CargaNormal { get; set; }
        public virtual int? idInicio { get; set; }
        public virtual int? idFin { get; set; }
        public virtual bool Recordatorio { get; set; }

    }
}
