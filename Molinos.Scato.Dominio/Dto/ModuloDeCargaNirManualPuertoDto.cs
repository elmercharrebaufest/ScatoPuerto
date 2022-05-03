using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaNirManualPuertoDto
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public string Hora { get; set; }
        public string Ritmo { get; set; }
        public string HD { get; set; }
        public string ProtBase { get; set; }
        public string Prot_BS { get; set; }
        public string PH { get; set; }
        public string Origen { get; set; }
        public string Mano { get; set; }
        public int? Material_id { get; set; }
        public int? Bodega_id { get; set; }
    }
}