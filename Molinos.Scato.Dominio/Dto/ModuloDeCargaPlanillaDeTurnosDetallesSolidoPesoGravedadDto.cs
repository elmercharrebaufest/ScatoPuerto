using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedadDto
    {
        public  int Id { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public int TotalTurnoMaterial { get; set; }
        public int KgGravedad { get; set; }
    }
}
