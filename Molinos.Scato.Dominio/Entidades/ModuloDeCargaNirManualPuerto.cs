using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ModuloDeCargaNirManualPuerto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual DateTime Fecha { get; set; }
        public virtual string Hora { get; set; }
        public virtual string Ritmo { get; set; }
        public virtual string HD { get; set; }
        public virtual string ProtBase { get; set; }
        public virtual string Prot_BS { get; set; }
        public virtual string PH { get; set; }
        public virtual string Origen { get; set; }
        public virtual string Mano { get; set; }
        public virtual ModuloDeCarga ModuloDeCarga { get; set; }
        public virtual int? Material_id { get; set; }
        public virtual Bodega Bodega { get; set; }
    }
}