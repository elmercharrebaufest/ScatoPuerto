using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCoemMercaderiaSueltaEmbalajeMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCoemMercaderiaSueltaEmbalajeMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AfipCoemMercaderiaSueltaEmbalaje, AfipCoemMercaderiaSueltaEmbalajeDto>();
            Mapper.CreateMap<AfipCoemMercaderiaSueltaEmbalajeDto, AfipCoemMercaderiaSueltaEmbalaje>();
        }
    }
}
