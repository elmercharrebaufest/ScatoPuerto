using Molinos.Scato.Dominio.Entidades.SAP;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
	public class TransaccionesSAP
	{
		[Key]
		public virtual long Id { get; set; }
		public virtual string Entidad { get; set; }
		public virtual long Entidad_Id { get; set; }
		public virtual string Operacion { get; set; }
		public virtual string PayloadXML { get; set; }
		public virtual string Estado { get; set; } // Pendiente, Enviado, Error
		public virtual string ResponseSAP { get; set; }
		public virtual int Reintento { get; set; }
		public virtual DateTime FechaCreacion { get; set; }
		public virtual string Usuario { get; set; }

		public virtual ICollection<TransaccionesSAPDetallesEmbarque> DetallesEmbarque { get; set; }
		public virtual ICollection<TransaccionesSAPBalanzada> DetallesBalanzada { get; set; }
	}
}