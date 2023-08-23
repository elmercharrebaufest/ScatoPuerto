using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class MuelleDeCargaMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "MuelleDeCargaMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<MuelleDeCarga, MuelleDeCargaDto>();
            Mapper.CreateMap<MuelleDeCargaDto, MuelleDeCarga>();
        }
    }
}
