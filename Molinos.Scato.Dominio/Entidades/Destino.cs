using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
	[Table("Destino")]
	public class Destino : IIdentificable
	{
		[Key]
		public virtual int Id { get; set; }
		public virtual string Nombre { get; set; }
		public virtual bool Activo { get; set; }
		public virtual string CodigoSap { get; set; }
		public virtual string Nacionalidad { get; set; }

		[Column("Bandera_Id")]
		public virtual int? BanderaId { get; set; }
		[ForeignKey("BanderaId")]
		public virtual Bandera Bandera { get; set; }

		public ICollection<Embarque> Embarques { get; set; }
		public ICollection<NominacionDatoTecnicoDestino> NominacionDatoTecnicoDestinos { get; set; }
	}
}