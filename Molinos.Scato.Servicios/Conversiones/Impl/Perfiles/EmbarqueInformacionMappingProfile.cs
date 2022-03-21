

using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class EmbarqueInformacionMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "EmbarqueInformacionMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<EmbarqueInformacion, EmbarqueInformacionDto>();
            Mapper.CreateMap<EmbarqueInformacionDto, EmbarqueInformacion>();
        }
    }
}