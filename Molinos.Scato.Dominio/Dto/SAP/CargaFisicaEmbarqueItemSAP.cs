namespace Molinos.Scato.Dominio.Dto.SAP
{
	public class CargaFisicaEmbarqueItemSAP
	{
		public string ExportadorSap { get; set; }
		public string MaterialSap { get; set; }
		public string DestinoSap { get; set; }
		public int NominacionId { get; set; }
		public int TipoDeContratoId { get; set; }
		public decimal Cantidad { get; set; }
	}
}
