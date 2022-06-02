using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ADPuertoGruposAdMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ADPuertoGruposAdMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ADPuertoGruposAd, ADPuertoGruposAdDto>();
            Mapper.CreateMap<ADPuertoGruposAdDto, ADPuertoGruposAd>();
        }
    }
}
