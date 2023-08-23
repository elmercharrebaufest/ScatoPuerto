using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class CompaniaDeFumigacionMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "CompaniaDeFumigacionMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<CompaniaDeFumigacion, CompaniaDeFumigacionDto>();
            Mapper.CreateMap<CompaniaDeFumigacionDto, CompaniaDeFumigacion>();
        }
    }
}
