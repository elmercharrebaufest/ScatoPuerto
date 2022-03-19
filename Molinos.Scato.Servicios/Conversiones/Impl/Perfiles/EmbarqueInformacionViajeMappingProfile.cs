using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class EmbarqueInformacionViajeMappingProfile : Profile
    {
        public override string ProfileName
        {
            get { return "EmbarqueInformacionViajeMappingProfile"; }
        }
        protected override void Configure()
        {
            Mapper.CreateMap<EmbarqueInformacionViaje, EmbarqueInformacionViajeDto>();
            Mapper.CreateMap<EmbarqueInformacionViajeDto, EmbarqueInformacionViaje>();
        }
    }
}