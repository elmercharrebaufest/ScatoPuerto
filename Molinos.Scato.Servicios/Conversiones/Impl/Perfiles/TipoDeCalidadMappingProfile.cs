using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class TipoDeCalidadMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "TipoDeCalidadMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<TipoDeCalidad, TipoDeCalidadDto>();
            Mapper.CreateMap<TipoDeCalidadDto, TipoDeCalidad>();
        }
    }
}
