using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class ADPuertoGruposRolesDto
    {
        public int Id_Grupo { get; set; }
        public int Id_Rol { get; set; }
        public ADPuertoGruposAdDto ADPuertoGruposAdDto { get; set; }
        public ADPuertoRolesDto ADPuertoRolesDto { get; set; }
    }
}
