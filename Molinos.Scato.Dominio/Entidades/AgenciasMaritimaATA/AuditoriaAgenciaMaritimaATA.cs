using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AuditoriaAgenciaMaritimaATA
    {
        [Key]
        public int Id { get; set; }
        public int Accion { get; set; }
        public ATAPuerto ATAPuerto { get; set; }
        public AgenciaMaritimaPuerto AgenciaMaritimaPuerto { get; set; }
        public string Nombre { get; set; }
        public string Cuit { get; set; }
        public string Activa { get; set; }
        public string Usuario { get; set; }
        public DateTime Fecha { get; set; }
    }
}
