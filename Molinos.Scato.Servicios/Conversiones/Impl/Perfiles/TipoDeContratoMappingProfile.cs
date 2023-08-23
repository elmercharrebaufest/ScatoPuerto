using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class TipoDeContratoMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "TipoContratoMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<TipoDeContrato, TipoDeContratoDto>();
            Mapper.CreateMap<TipoDeContratoDto, TipoDeContrato>();
        }
    }
}
