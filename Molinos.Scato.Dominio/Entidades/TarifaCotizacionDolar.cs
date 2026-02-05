using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
	public class TarifaCotizacionDolar : IIdentificable
	{
		[Key]
		public virtual int Id { get; set; }

		public virtual DateTime Periodo { get; set; }

		public virtual decimal ValorDolar { get; set; }

		public virtual DateTime FechaActualizacion { get; set; }

		public virtual string UsuarioActualizacion { get; set; }
	}
}