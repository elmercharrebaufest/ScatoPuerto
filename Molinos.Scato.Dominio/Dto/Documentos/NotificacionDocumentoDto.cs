using Molinos.Scato.Dominio.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class NotificacionDocumentoDto
    {
        public int Id { get; set; }
        public string Mensaje { get; set; }
        public DateTime? Fecha { get; set; }
        public DateTime? FechaEliminacion { get; set; }
        public string UsuarioEliminacion { get; set; }
    }
}
