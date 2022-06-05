using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ADPuertoPermisos : IIdentificable
	{
		[Key]
		public virtual int Id { get; set; }
		[Required]
		public virtual string NombrePermiso { get; set; }
	}
}
