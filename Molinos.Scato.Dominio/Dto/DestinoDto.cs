using System.ComponentModel.DataAnnotations;
using Molinos.Scato.Dominio.Recursos;

namespace Molinos.Scato.Dominio.Dto
{
	public sealed class DestinoDto
	{
		public int Id { get; set; }
		public string Nombre { get; set; }
		public bool Activo { get; set; }
		public string CodigoSap { get; set; }
		public string Nacionalidad { get; set; }
		public BanderaDto Bandera { get; set; }
	}
}