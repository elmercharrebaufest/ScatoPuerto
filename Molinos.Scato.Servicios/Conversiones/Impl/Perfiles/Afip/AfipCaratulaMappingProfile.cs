using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCaratulaMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCaratulaMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AfipCaratula, AfipCaratulaDto>()
                .ForMember(x => x.Itinerario, x => x.MapFrom(y => y.Itinerario));
            Mapper.CreateMap<AfipCaratulaDto, AfipCaratula>();
        }
    }
}
