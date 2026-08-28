using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class CamaraAduanaMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "CamaraAduanaMappingProfile"; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<CamaraAduana, CamaraAduanaDto>();
            Mapper.CreateMap<CamaraAduanaDto, CamaraAduana>();
        }
    }
}
