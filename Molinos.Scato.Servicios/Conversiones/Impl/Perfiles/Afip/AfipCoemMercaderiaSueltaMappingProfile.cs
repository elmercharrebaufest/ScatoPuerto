using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCoemMercaderiaSueltaMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCoemMercaderiaSueltaMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AfipCoemMercaderiaSuelta, AfipCoemMercaderiaSueltaDto>();
            Mapper.CreateMap<AfipCoemMercaderiaSueltaDto, AfipCoemMercaderiaSuelta>();
        }
    }
}
