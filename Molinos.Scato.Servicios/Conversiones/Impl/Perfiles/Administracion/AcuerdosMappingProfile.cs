using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;

namespace Molinos.Scato.Servicios.Conversiones.Impl.Perfiles
{
    public class AcuerdosMappingProfile : Profile
    {
        public override string ProfileName { get { return "AcuerdosMappingProfile"; } }
        protected override void Configure()
        {
            Mapper.CreateMap<AcuerdoTipo, AcuerdoTipoDto>();
            Mapper.CreateMap<AcuerdoTipoDto, AcuerdoTipo>();

            Mapper.CreateMap<AcuerdoTipoConfiguracionConcepto, AcuerdoTipoConfiguracionConceptoDto>();
            Mapper.CreateMap<AcuerdoTipoConfiguracionConceptoDto, AcuerdoTipoConfiguracionConcepto>();

            Mapper.CreateMap<AcuerdoTipoConfiguracion, AcuerdoTipoConfiguracionDto>()
                .ForMember(dest => dest.AcuerdoTipoConfiguracionConceptos, opt => opt.MapFrom(src => src.AcuerdoTipoConfiguracionConceptos));
            Mapper.CreateMap<AcuerdoTipoConfiguracionDto, AcuerdoTipoConfiguracion>()
                .ForMember(dest => dest.AcuerdoTipoConfiguracionConceptos, opt => opt.MapFrom(src => src.AcuerdoTipoConfiguracionConceptos));

            Mapper.CreateMap<AcuerdoDetalleConcepto, AcuerdoDetalleConceptoDto>();
            Mapper.CreateMap<AcuerdoDetalleConceptoDto, AcuerdoDetalleConcepto>();

            Mapper.CreateMap<AcuerdoDetalle, AcuerdoDetalleDto>()
                .ForMember(dest => dest.AcuerdoDetalleConceptos, opt => opt.MapFrom(src => src.AcuerdoDetalleConceptos));
            Mapper.CreateMap<AcuerdoDetalleDto, AcuerdoDetalle>()
                .ForMember(dest => dest.AcuerdoDetalleConceptos, opt => opt.MapFrom(src => src.AcuerdoDetalleConceptos));

            Mapper.CreateMap<Acuerdo, AcuerdoDto>()
                .ForMember(dest => dest.AcuerdoDetalles, opt => opt.MapFrom(src => src.AcuerdoDetalles));
            Mapper.CreateMap<AcuerdoDto, Acuerdo>()
                .ForMember(dest => dest.AcuerdoDetalles, opt => opt.MapFrom(src => src.AcuerdoDetalles));
        }
    }
}
