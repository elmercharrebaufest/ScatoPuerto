using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AfipCoemMappingProfile : Profile
    {
        public override string ProfileName { get { return "AfipCoemMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AfipCoemContenedorConCargaDeclaracion, AfipCoemContenedorConCargaDeclaracionDto>();
            Mapper.CreateMap<AfipCoemContenedorConCargaDeclaracionDto, AfipCoemContenedorConCargaDeclaracion>();
            Mapper.CreateMap<AfipCoemContenedorConCargaDeclaracionDto, Declaracion>()
                .ForMember(dest => dest.ExtensionData, opt => opt.Ignore());

            Mapper.CreateMap<AfipCoemContenedorConCargaPrecinto, AfipCoemContenedorConCargaPrecintoDto>();
            Mapper.CreateMap<AfipCoemContenedorConCargaPrecintoDto, AfipCoemContenedorConCargaPrecinto>();
            Mapper.CreateMap<AfipCoemContenedorConCargaPrecintoDto, AFIPServicioComunicacionEmbarque.Precinto>()
                .ForMember(dest => dest.ExtensionData, opt => opt.Ignore());

            Mapper.CreateMap<AfipCoemContenedorConCarga, AfipCoemContenedorConCargaDto>()
                .ForMember(x => x.Precintos, x => x.MapFrom(y => y.Precintos))
                .ForMember(x => x.Declaraciones, x => x.MapFrom(y => y.Declaraciones));
            Mapper.CreateMap<AfipCoemContenedorConCargaDto, AfipCoemContenedorConCarga>();
            Mapper.CreateMap<AfipCoemContenedorConCargaDto, ContenedorCarga>()
                .ForMember(dest => dest.ExtensionData, opt => opt.Ignore());

            Mapper.CreateMap<AfipCoemContenedorVacio, AfipCoemContenedorVacioDto>();
            Mapper.CreateMap<AfipCoemContenedorVacioDto, AfipCoemContenedorVacio>();
            Mapper.CreateMap<AfipCoemContenedorVacioDto, ContenedorVacio>()
                .ForMember(dest => dest.ExtensionData, opt => opt.Ignore());

            Mapper.CreateMap<AfipCoemMercaderiaSueltaEmbalaje, AfipCoemMercaderiaSueltaEmbalajeDto>();
            Mapper.CreateMap<AfipCoemMercaderiaSueltaEmbalajeDto, AfipCoemMercaderiaSueltaEmbalaje>();
            Mapper.CreateMap<AfipCoemMercaderiaSueltaEmbalajeDto, Embalaje>()
                .ForMember(dest => dest.ExtensionData, opt => opt.Ignore());

            Mapper.CreateMap<AfipCoemMercaderiaSuelta, AfipCoemMercaderiaSueltaDto>();
            Mapper.CreateMap<AfipCoemMercaderiaSueltaDto, AfipCoemMercaderiaSuelta>();
            Mapper.CreateMap<AfipCoemMercaderiaSueltaDto, MercaderiaSuelta>()
                .ForMember(dest => dest.ExtensionData, opt => opt.Ignore());

            // TODO: BORRAR
            Mapper.CreateMap<AfipCoemEstado, AfipCoemEstadoDto>();
            Mapper.CreateMap<AfipCoemEstadoDto, AfipCoemEstado>();
            // -------------

            Mapper.CreateMap<AfipCoem, AfipCoemDto>()
                .ForMember(x => x.ContenedoresConCarga, x => x.MapFrom(y => y.ContenedoresConCarga))
                .ForMember(x => x.ContenedoresVacios, x => x.MapFrom(y => y.ContenedoresVacios))
                .ForMember(x => x.MercaderiasSueltas, x => x.MapFrom(y => y.MercaderiasSueltas));
            Mapper.CreateMap<AfipCoemDto, AfipCoem>();

            Mapper.CreateMap<AfipCoemDto, Coem>()
                .ForMember(dest => dest.ExtensionData, opt => opt.Ignore());
            Mapper.CreateMap<AfipCoemRegistrarRequest, AfipCoemDto>()
                .ForMember(x => x.FechaRegistro, y => y.Ignore())
                .ForMember(x => x.IdentificadorCOEM, y => y.Ignore())
                .ForMember(x => x.Id, y => y.Ignore());
        }
    }
}
