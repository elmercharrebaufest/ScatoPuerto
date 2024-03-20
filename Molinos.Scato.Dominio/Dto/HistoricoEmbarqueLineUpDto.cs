namespace Molinos.Scato.Dominio.Dto
{
	public class HistoricoEmbarqueLineUpDto
	{
		public long Id { get; set; }
		public string VaporNombre { get; set; }
		public string Actualizado { get; set; }
		public string Ubicacion { get; set; }
		public bool CartaSubidaEnviada { get; set; }
		public string CartaSubidaAprobada { get; set; }
		public bool CargaEnSap {  get; set; }
		public bool NominacionDePractico { get; set; }
		public bool SeguridadPortuaria { get; set; }
		public bool InspeccionSenasa { get; set; }
		public bool ControlSenasa { get; set; }
		public bool ControlPrivado { get; set; }
		public bool Amarrador { get; set; }
		public bool AgenciaContactada { get; set; }
		public string FechaRecalada { get; set; }
		public string PuertoActual { get; set; }
		public string Observaciones { get; set; }
		public string Materiales { get; set; }
		public bool PlanoDeCargaEnviado { get; set; }
		public string ObligacionCarga { get; set; }
		public string AgenteNombre { get; set; }
		public string AtaNombre { get; set; }
		public int LineUpId { get; set; }
		public int EmbarqueId { get; set; }
	}
}
