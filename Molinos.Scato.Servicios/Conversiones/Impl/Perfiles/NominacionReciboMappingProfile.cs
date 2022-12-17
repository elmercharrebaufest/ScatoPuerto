using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class NominacionReciboMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "NominacionReciboMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<NominacionRecibo, NominacionReciboDto>();
            Mapper.CreateMap<NominacionReciboDto, NominacionRecibo>();
        }
    }
}
