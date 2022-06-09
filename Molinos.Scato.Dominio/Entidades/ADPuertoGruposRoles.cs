using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ADPuertoGruposRoles
	{
		[Key, Column(Order = 0)]
		public virtual int Id_Grupo { get; set; }
		[Key, Column(Order = 1)]
		public virtual int Id_Rol { get; set; }
		public ADPuertoGruposAd ADPuertoGruposAd { get; set; }
		public ADPuertoRoles ADPuertoRoles { get; set; }

	}
}
