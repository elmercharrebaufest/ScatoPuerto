using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaPlanillaDeTurnosUltimaActualizacionDto
    {
        public int Id { get; set; }
        public int Carga_Id { get; set; }
        public DateTime? Fecha { get; set; }
        public string NumeroBalanza { get; set; }

    }
}