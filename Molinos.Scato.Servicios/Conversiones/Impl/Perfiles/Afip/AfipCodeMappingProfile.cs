using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCodeMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCodeMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AfipCode, AfipCodeDto>().
                ForMember(t => t.IdentificadoresCOEM, f => f.MapFrom(r => r.IdentificadoresCOEM));
            Mapper.CreateMap<AfipCodeDto, AfipCode>();
        }
    }
}
