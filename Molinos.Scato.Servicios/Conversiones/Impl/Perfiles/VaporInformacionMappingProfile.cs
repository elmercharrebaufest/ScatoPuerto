using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class VaporInformacionMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "VaporInformacionMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<VaporInformacion, VaporInformacionDto>();
            Mapper.CreateMap<VaporInformacionDto, VaporInformacion>();
        }
    }
}