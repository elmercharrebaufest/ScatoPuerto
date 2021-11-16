using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class CalleMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "CalleMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<Calle, CalleDto>();
            Mapper.CreateMap<CalleDto, Calle>();
        }
    }
}