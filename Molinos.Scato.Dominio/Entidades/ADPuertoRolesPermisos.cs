using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ADPuertoRolesPermisos
	{
        [Key, Column(Order = 0)]
		public virtual int Id_Rol { get; set; }
		[Key, Column(Order = 1)]
		public virtual int Id_Permiso { get; set; }
		public ADPuertoRoles ADPuertoRoles { get; set; }
		public ADPuertoPermisos ADPuertoPermisos { get; set; }

	}
}
