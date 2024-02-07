using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.Enumeradores;
using System.Linq;

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

            Mapper.CreateMap<AfipSolicitudNoABordo, AfipSolicitudNoABordoDto>()
                .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => ((EstadosSolicitudesAFIP)src.Estado).ToString()))
                .ForMember(dest => dest.Motivo, opt => opt.MapFrom(src => src.AfipMotivoNoABordo.Descripcion))
                .ForMember(dest => dest.Declaraciones, opt => opt.MapFrom(src => src.AfipSolicitudNoABordoDeclaraciones
                    .Select(d => d.AfipCoemMercaderiaSuelta.IdentificadorDeclaracion).ToList()));

            Mapper.CreateMap<AfipCoem, AfipCoemDto>()
                .ForMember(x => x.ContenedoresConCarga, x => x.MapFrom(y => y.ContenedoresConCarga))
                .ForMember(x => x.ContenedoresVacios, x => x.MapFrom(y => y.ContenedoresVacios))
                .ForMember(x => x.MercaderiasSueltas, x => x.MapFrom(y => y.MercaderiasSueltas))
                .ForMember(x => x.AfipSolicitudesNoABordo, x => x.MapFrom(y => y.AfipSolicitudesNoABordo));
            Mapper.CreateMap<AfipCoemDto, AfipCoem>();

            Mapper.CreateMap<AfipCoemDto, Coem>()
                .ForMember(dest => dest.ExtensionData, opt => opt.Ignore());
            Mapper.CreateMap<AfipCoemRegistrarRequest, AfipCoemDto>()
                .ForMember(x => x.FechaRegistro, y => y.Ignore())
                .ForMember(x => x.IdentificadorCOEM, y => y.Ignore())
                .ForMember(x => x.Id, y => y.Ignore());

            #region Solicitud Cierre de Carga
            Mapper.CreateMap<AfipSolicitarCierreCargaGranelCoemDeclaracionDto, DeclaracionGranel>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => new[] { new Item { numeroItem = 1, cantidadReal = src.CantidadReal, ExtensionData = null } }))
                .ForMember(dest => dest.IdentificadorCierreCumplido, opt => opt.MapFrom(src => "N"))
                .ForMember(dest => dest.ExtensionData, opt => opt.Ignore());

            Mapper.CreateMap<AfipSolicitarCierreCargaGranelCoemDto, CoemGranel>()
                .ForMember(dest => dest.Declaraciones, opt => opt.MapFrom(src => src.Declaraciones))
                .ForMember(dest => dest.ExtensionData, opt => opt.Ignore());

            Mapper.CreateMap<AfipSolicitarCierreCargaGranelDto, SolicitarCierreCargaGranelRequest>()
               .ForMember(dest => dest.Coems, opt => opt.MapFrom(src => src.Coems))
               .ForMember(dest => dest.ExtensionData, opt => opt.Ignore());
            #endregion
        }
    }
}
