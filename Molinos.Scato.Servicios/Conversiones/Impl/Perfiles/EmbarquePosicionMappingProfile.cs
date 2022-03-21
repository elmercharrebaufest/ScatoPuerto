using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class EmbarquePosicionMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "EmbarquePosicionMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<EmbarquePosicion, EmbarquePosicionDto>();
            Mapper.CreateMap<EmbarquePosicionDto, EmbarquePosicion>();
        }
    }
}