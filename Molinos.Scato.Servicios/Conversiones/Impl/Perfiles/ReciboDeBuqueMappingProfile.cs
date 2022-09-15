using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class ReciboDeBuqueMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "ReciboDeBuqueMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<ReciboDeBuque, ReciboDeBuqueDto>();
            Mapper.CreateMap<ReciboDeBuqueDto, ReciboDeBuque>();
        }
    }
}