using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class ErroresGeolocalizacionDto
    {
        public  int Id { get; set; }
        //   [Required]
        public  int Embarque_id { get; set; }
        public  string NombreBuque { get; set; }
        public  string TipoBuque { get; set; }
        public  string Bandera { get; set; }
        public  string IMO { get; set; }
        public  string Mensaje { get; set; }
        public  DateTime FechaError { get; set; }

    }
}