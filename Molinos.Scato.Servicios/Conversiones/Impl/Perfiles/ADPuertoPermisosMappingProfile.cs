using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ADPuertoPermisosMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ADPuertoPermisosMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ADPuertoPermisos, ADPuertoPermisosDto>();
            Mapper.CreateMap<ADPuertoPermisosDto, ADPuertoPermisos>();
        }
    }
}
