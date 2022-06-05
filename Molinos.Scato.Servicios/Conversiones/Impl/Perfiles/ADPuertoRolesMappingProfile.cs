using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ADPuertoRolesMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ADPuertoRolesMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ADPuertoRoles, ADPuertoRolesDto>();
            Mapper.CreateMap<ADPuertoRolesDto, ADPuertoRoles>();
        }
    }
}
