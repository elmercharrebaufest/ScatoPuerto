using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ADPuertoGruposAd : IIdentificable
	{
		[Key]
		public virtual int Id { get; set; }
		[Required]
		public virtual string NombreGrupoAd { get; set; }
	}
}
