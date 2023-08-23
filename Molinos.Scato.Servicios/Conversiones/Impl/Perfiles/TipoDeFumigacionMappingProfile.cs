using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class TipoDeFumigacionMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "TipoDeFumigacionMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<TipoDeFumigacion, TipoDeFumigacionDto>();
            Mapper.CreateMap<TipoDeFumigacionDto, TipoDeFumigacion>();
        }
    }
}
