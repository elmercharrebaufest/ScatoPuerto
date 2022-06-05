using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class BanderaMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "BanderaMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<Bandera, BanderaDto>();
            Mapper.CreateMap<BanderaDto, Bandera>();
        }
    }
}
