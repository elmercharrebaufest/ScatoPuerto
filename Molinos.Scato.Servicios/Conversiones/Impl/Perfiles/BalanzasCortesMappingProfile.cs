using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class BalanzasCortesMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "BalanzasCortesMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<BalanzasCortes, BalanzasCortesDto>();
            Mapper.CreateMap<BalanzasCortesDto, BalanzasCortes>();

        }
    }
}