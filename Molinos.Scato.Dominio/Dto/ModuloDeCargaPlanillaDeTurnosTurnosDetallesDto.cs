using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaPlanillaDeTurnosDetallesDto
    {
        public int Id { get; set; }
        public ExportadorDto Exportador { get; set; }
        public int Linea_Id { get; set; }
        //public ModuloDeCargaLineasDeEmbarque Linea { get; set; }
        public int BodegaParcel { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public string Tk { get; set; }
        public double Temperatura { get; set; }
        public double MedidaInicialCM { get; set; }
        public double MedidaInicialMM { get; set; }
        public double MedidaFinalCM { get; set; }
        public double MedidaFinalMM { get; set; }
        public DestinoDto Destino { get; set; }
        public decimal Cantidad { get; set; }
    }
}