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
                .ForMember(x => x.ModuloDeCargaPlanillaDeTurnosDetalles,
                x => x.MapFrom(y => y.ModuloDeCargaPlanillaDeTurnosDetalles))
                .ForMember(x => x.ModuloDeCargaPlanillaDeTurnosCortes,
                x => x.MapFrom(y => y.ModuloDeCargaPlanillaDeTurnosCortes));
            Mapper.CreateMap<ModuloDeCargaPlanillaDeTurnosDto, ModuloDeCargaPlanillaDeTurnos>();
        }
    }
}