using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class SiloCeldaMappingProfile : Profile
    {
        public override string ProfileName => "SiloCeldaMappingProfile";
        protected override void Configure()
        {
            Mapper.CreateMap<SiloCelda, SiloCeldaDto>();
            Mapper.CreateMap<SiloCeldaDto, SiloCelda>();
        }
    }
}
