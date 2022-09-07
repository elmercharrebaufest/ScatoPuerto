using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class BalanzasCortesDto : ICloneable
    {
        public int Id { get; set; }
        public string NumeroBalanza { get; set; }
        public int ModuloDeCarga_id { get; set; }
        public int? MotivosFallasBalanza_id { get; set; }
        public string Observaciones { get; set; }
        public DateTime? Fecha_Inicio { get; set; }
        public DateTime? Fecha_Corte { get; set; }
        public int? Bodega_id { get; set; }
        public int? Material_id { get; set; }
        public int? Kg { get; set; }
        public int? Tn { get; set; }
        public bool Cerrado { get; set; }
        public bool CorteManual { get; set; }
        public int? Exportador_Id { get; set; }
        public int? Destino_Id { get; set; }
        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}