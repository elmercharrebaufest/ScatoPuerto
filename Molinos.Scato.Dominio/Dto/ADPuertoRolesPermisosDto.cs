using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class ADPuertoRolesPermisosDto
    {
        public int Id_Rol { get; set; }
        public int Id_Permiso { get; set; }
        public ADPuertoRolesDto ADPuertoRolesDto { get; set; }
        public ADPuertoPermisosDto ADPuertoPermisosDto { get; set; }
    }
}
