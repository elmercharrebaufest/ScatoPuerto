using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class ProgramaEmbarqueNominacionDatoTecnicoDto
    {
        public IList<MaterialPuertoDto> MaterialPuerto { get; set; }
        public IList<TipoDeCalidadDto> TipoDeCalidad { get; set; }
        public IList<DestinoDto> Destino { get; set; }
        public IList<ExportadorDto> Exportador { get; set; }
        public IList<CoordinadorPuertoDto> CoordinadorPuerto { get; set; }
        public IList<VaporInformacionDto> VaporInformacion { get; set; }
        public IList<BanderaDto> Bandera { get; set; }
        public IList<MuelleDeCargaDto> MuelleDeCarga { get; set; }
        public IList<TasaDeCargaDto> TasaDeCarga { get; set; }
        public IList<TipoDeContratoDto> TipoDeContrato { get; set; }
        public IList<ATAPuertoDto> ATAPuerto { get; set; }
        public IList<AgenciaMaritimaPuertoDto> AgenciaMaritimaPuerto { get; set; }
        public IList<SurveyorDto> Surveyor { get; set; }
        public IList<CalidadValorDto> CalidadValor { get; set; }
        public IList<MuelleDto> OtrosMuelles { get; set; }
    }


}
