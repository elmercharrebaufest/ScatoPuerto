using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCoemContenedorConCargaPrecintoMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCoemContenedorConCargaPrecintoMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AfipCoemContenedorConCargaPrecinto, AfipCoemContenedorConCargaPrecintoDto>();
            Mapper.CreateMap<AfipCoemContenedorConCargaPrecintoDto, AfipCoemContenedorConCargaPrecinto>();
        }
    }
}
