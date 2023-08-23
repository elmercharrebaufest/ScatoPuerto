using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class CalidadValorMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "CalidadValorMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<CalidadValor, CalidadValorDto>();
            Mapper.CreateMap<CalidadValorDto, CalidadValor>();
        }
    }
}
