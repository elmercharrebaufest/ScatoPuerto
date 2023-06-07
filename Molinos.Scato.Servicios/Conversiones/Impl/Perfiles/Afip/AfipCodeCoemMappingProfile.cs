using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCodeCoemMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCodeCoemMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AfipCodeCoem, AfipCodeCoemDto>().
                ForMember(t => t.Identificador, f => f.MapFrom(r => r.AfipCoem.IdentificadorCOEM));
            Mapper.CreateMap<AfipCodeCoemDto, AfipCodeCoem>();
        }
    }
}
