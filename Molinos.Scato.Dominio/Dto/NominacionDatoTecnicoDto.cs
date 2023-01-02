using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class NominacionDatoTecnicoDto
    {
        public int Id { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public int CantidadTotal { get; set; }
        public int Tolerancia { get; set; }
        public string Observaciones { get; set; }
        public VaporInformacionDto VaporInformacion { get; set; }
        public DateTime? ETARecalada { get; set; }
        public DateTime? ObligacionDeCarga { get; set; }
        public MuelleDeCargaDto MuelleDeCarga { get; set; }
        public TasaDeCargaDto TasaDeCarga { get; set; }
        public int? TasaDeCargaValor { get; set; }
        public decimal DEM { get; set; }
        public decimal DES { get; set; }
        public TipoDeContratoDto TipoDeContrato { get; set; }
        public ATAPuertoDto ATAPuerto { get; set; }
        public AgenciaMaritimaPuertoDto AgenciaMaritimaPuerto { get; set; }
        public SurveyorDto Surveyor { get; set; }
        public string ObservacionesSurveyor { get; set; }
        public ICollection<NominacionDatoTecnicoCalidadDto> NominacionDatoTecnicoCalidad { get; set; }
        public ICollection<NominacionDatoTecnicoCoordinadorPuertoDto> NominacionDatoTecnicoCoordinadorPuerto { get; set; }
        public ICollection<NominacionDatoTecnicoExportadorDto> NominacionDatoTecnicoExportador { get; set; }
        public ICollection<NominacionDatoTecnicoDestinoDto> NominacionDatoTecnicoDestino { get; set; }
    }
}
