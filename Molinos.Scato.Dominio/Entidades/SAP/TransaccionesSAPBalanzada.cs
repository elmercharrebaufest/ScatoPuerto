using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades.SAP
{
	public class TransaccionesSAPBalanzada
	{
		[Key]
		public virtual long Id { get; set; }
		public virtual long TransaccionesSAP_Id { get; set; }
		[ForeignKey("TransaccionesSAP_Id")]
		public virtual TransaccionesSAP TransaccionSAP { get; set; }
		public virtual int BalanzadaId { get; set; }
		public virtual string NumeroBalanza { get; set; }
		public virtual string MaterialSap { get; set; }
		public virtual string ExportadorSap { get; set; }
		public virtual string AlmacenOrigenSap { get; set; }
		public virtual string AlmacenDestinoSap { get; set; }
		public virtual decimal PesoNeto { get; set; }
		public virtual DateTime Fecha { get; set; }
		public virtual string Estado { get; set; }
	}
}
