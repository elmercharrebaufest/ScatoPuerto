using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ObservacionesDeCalidadMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ObservacionesDeCalidadMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ObservacionesDeCalidad, ObservacionesDeCalidadDto>();
            Mapper.CreateMap<ObservacionesDeCalidadDto, ObservacionesDeCalidad>();
        }
    }
}