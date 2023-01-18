using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class NominacionLineUpDto
    {
        public int Vapor_Id { get; set; }
        public int Nominacion_Id { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public MuelleDeCargaDto MuelleDeCarga { get; set; }
        public ICollection<NominacionCargadorPorCantidadDto> NominacionCargadorPorCantidad { get; set; }
        public int Embarque_Id { get; set; }
        public bool EnviadoLineUp { get; set; }
        public DateTime? FechaEnvioLineUp { get; set; }
    }

    public class NominacionCargadorPorCantidadDto
    {
        public ExportadorDto Exportador { get; set; }
        public int Cantidad { get; set; }
    }
}
