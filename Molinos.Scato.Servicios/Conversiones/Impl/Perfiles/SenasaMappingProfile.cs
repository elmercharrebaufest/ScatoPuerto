using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class SenasaMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "SenasaMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<Senasa, SenasaDto>();
            Mapper.CreateMap<SenasaDto, Senasa>();
        }
    }
}
