using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ModuloDeCargaNirManualPuertoMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ModuloDeCargaNirManualPuertoMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ModuloDeCargaNirManualPuerto, ModuloDeCargaNirManualPuertoDto>();
            Mapper.CreateMap<ModuloDeCargaNirManualPuertoDto, ModuloDeCargaNirManualPuerto>();
        }
    }
}