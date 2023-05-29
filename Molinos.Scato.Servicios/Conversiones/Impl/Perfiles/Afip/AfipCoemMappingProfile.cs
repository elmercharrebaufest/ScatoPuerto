using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCoemMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCoemMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AfipCoem, AfipCoemDto>()
                .ForMember(x => x.ContenedoresConCarga, x => x.MapFrom(y => y.ContenedoresConCarga))
                .ForMember(x => x.ContenedoresVacios, x => x.MapFrom(y => y.ContenedoresVacios))
                .ForMember(x => x.MercaderiasSueltas, x => x.MapFrom(y => y.MercaderiasSueltas));
            Mapper.CreateMap<AfipCoemDto, AfipCoem>();
        }
    }
}
