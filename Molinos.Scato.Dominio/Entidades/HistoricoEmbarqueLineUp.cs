using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
	public class HistoricoEmbarqueLineUp
	{
		[Key]
		public virtual long Id { get; set; }
		public virtual string VaporNombre { get; set; }
		public virtual string Actualizado { get; set; }
		public virtual string Ubicacion { get; set; }
		public virtual bool CartaSubidaEnviada { get; set; }
		public virtual string CartaSubidaAprobada { get; set; }
		public virtual bool CargaEnSap { get; set; }
		public virtual bool NominacionDePractico { get; set; }
		public virtual bool SeguridadPortuaria { get; set; }
		public virtual bool InspeccionSenasa { get; set; }
		public virtual bool ControlSenasa { get; set; }
		public virtual bool ControlPrivado { get; set; }
		public virtual bool Amarrador { get; set; }
		public virtual bool AgenciaContactada { get; set; }
		public virtual string FechaRecalada { get; set; }
		public virtual string PuertoActual { get; set; }
		public virtual string Observaciones { get; set; }
		public virtual string Materiales { get; set; }
		public virtual bool PlanoDeCargaEnviado { get; set; }
		public virtual string ObligacionCarga { get; set; }
		public virtual string AgenteNombre { get; set; }
		public virtual string AtaNombre { get; set; }
		public virtual int LineUpId { get; set; }
		public virtual int EmbarqueId { get; set; }

		public virtual LineUp LineUp { get; set; }
		public virtual Embarque Embarque { get; set; }
	}
}
