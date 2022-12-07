using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class NominacionMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "NominacionMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<Nominacion, NominacionDto>();
            Mapper.CreateMap<NominacionDto, Nominacion>();
        }
    }
}
