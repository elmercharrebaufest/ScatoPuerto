using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ModuloDeCargaPlanillaDeTurnosCortesMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ModuloDeCargaPlanillaDeTurnosCortesMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosCortes, ModuloDeCargaPlanillaDeTurnosCortesDto>();
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosCortesDto, ModuloDeCargaPlanillaDeTurnosCortes>();
        }
    }
}