using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class NominacionDetalleIntervencionMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "NominacionDetalleIntervencionMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<NominacionDetalleIntervencion, NominacionDetalleIntervencionDto>();
            Mapper.CreateMap<NominacionDetalleIntervencionDto, NominacionDetalleIntervencion>();
        }
    }
}
