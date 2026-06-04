using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades.SAP
{
	public class TransaccionesSAPDetallesEmbarque
	{
		public virtual long Id { get; set; }
		public virtual long TransaccionesSAP_Id { get; set; }
		public virtual TransaccionesSAP TransaccionSAP { get; set; }
		public virtual int NominacionId { get; set; }
		public virtual string NroNom_SAP { get; set; }
		public virtual int TipoDeContratoId { get; set; }
		public virtual string ExportadorSap { get; set; }
		public virtual string MaterialSap { get; set; }
		public virtual string DestinoSap { get; set; }
		public virtual decimal Cantidad { get; set; }
		public virtual string OperacionItem { get; set; }
	}
}
