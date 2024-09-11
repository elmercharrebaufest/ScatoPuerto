using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class ValidacionTraslapeFechasBalanzaManualDto
    {
        public int Id { get; set; }
        public TurnoPuertoDto TurnoPuerto { get; set; }
        public int NumeroBalanza { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaCorte { get; set; }
        public bool Traslapa { get; set; }
        public string IdsTraslape { get; set; }
        public int Grupo { get; set; }
    }
}
