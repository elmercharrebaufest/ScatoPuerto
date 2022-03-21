
using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class PuntosInteresGeolocalizacionMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "PuntosInteresGeolocalizacionMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<PuntosInteresGeolocalizacion, PuntosInteresGeolocalizacionDto>();
            Mapper.CreateMap<PuntosInteresGeolocalizacionDto, PuntosInteresGeolocalizacion>();
        }
    }
}