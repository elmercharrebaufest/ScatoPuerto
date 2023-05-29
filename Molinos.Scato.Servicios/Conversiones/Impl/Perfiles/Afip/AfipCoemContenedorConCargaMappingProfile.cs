
using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCoemContenedorConCargaMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCoemContenedorConCargaMappingProfile"; } }

        protected override void Configure()
        {
            Mapper.CreateMap<AfipCoemContenedorConCarga, AfipCoemContenedorConCargaDto>()
                .ForMember(x => x.Precintos, x => x.MapFrom(y => y.Precintos))
                .ForMember(x => x.Declaraciones, x => x.MapFrom(y => y.Declaraciones));
            Mapper.CreateMap<AfipCoemContenedorConCargaDto, AfipCoemContenedorConCarga>();
        }
    }
}
