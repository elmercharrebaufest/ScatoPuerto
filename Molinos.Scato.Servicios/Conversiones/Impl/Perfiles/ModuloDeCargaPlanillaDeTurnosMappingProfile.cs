using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ModuloDeCargaPlanillaDeTurnosMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ModuloDeCargaPlanillaDeTurnosMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnos, ModuloDeCargaPlanillaDeTurnosDto>()
                .ForMember(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido,
                x => x.MapFrom(y => y.ModuloDeCargaPlanillaDeTurnosDetallesLiquido))
                .ForMember(x => x.ModuloDeCargaPlanillaDeTurnosCortes,
                x => x.MapFrom(y => y.ModuloDeCargaPlanillaDeTurnosCortes));
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosDto, ModuloDeCargaPlanillaDeTurnos>();
        }
    }
}
