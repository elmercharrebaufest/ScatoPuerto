using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCoemContenedorConCargaDeclaracionMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCaratulaCoemContenedorConCargaDeclaracionMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AfipCoemContenedorConCargaDeclaracion, AfipCoemContenedorConCargaDeclaracionDto>();
            Mapper.CreateMap<AfipCoemContenedorConCargaDeclaracionDto, AfipCoemContenedorConCargaDeclaracion>();
        }
    }
}
