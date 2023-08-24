using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCaratulaMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCaratulaMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AfipCaratula, AfipCaratulaDto>()
                .ForMember(x => x.Itinerario, x => x.MapFrom(y => y.Itinerario));

            Mapper.CreateMap<AfipCaratulaDto, AfipCaratula>()
                .ForMember(x => x.Itinerario, x => x.MapFrom(y => y.Itinerario));

            Mapper.CreateMap<AfipCaratulaDto, Caratula>()
                .ForMember(dest => dest.ExtensionData, opt => opt.Ignore());

            Mapper.CreateMap<AfipCaratulaItinerarioDto, Puerto>()
                .ForMember(dest => dest.CodigoPuerto, opt => opt.MapFrom(src => src.Puerto));

        }
    }
}
