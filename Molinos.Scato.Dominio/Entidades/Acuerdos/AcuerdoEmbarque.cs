using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
	public class AcuerdoEmbarque : IIdentificable
	{
		[Key]
		public virtual int Id { get; set; }

		public virtual Acuerdo Acuerdo { get; set; }

		public virtual Embarque Embarque { get; set; }

		public virtual MaterialPuerto MaterialPuerto { get; set; }

		public virtual decimal Cantidad { get; set; }
	}
}