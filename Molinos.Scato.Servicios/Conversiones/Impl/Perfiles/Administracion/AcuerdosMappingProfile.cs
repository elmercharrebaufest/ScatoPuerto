using AutoMapper;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using System.Linq;

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
                .ForMember(dest => dest.AcuerdoTipoConfiguracionConceptos, opt => opt.MapFrom(src => src.AcuerdoTipoConfiguracionConceptos
                    .OrderBy(c => c.Concepto.Orden.HasValue ? 0 : 1) // primero los que tienen orden
                    .ThenBy(c => c.Concepto.Orden)
                ));
            Mapper.CreateMap<AcuerdoTipoConfiguracionDto, AcuerdoTipoConfiguracion>();

            Mapper.CreateMap<AcuerdoDetalleConcepto, AcuerdoDetalleConceptoDto>();
            Mapper.CreateMap<AcuerdoDetalleConceptoDto, AcuerdoDetalleConcepto>();

            Mapper.CreateMap<AcuerdoDetalle, AcuerdoDetalleDto>();
            Mapper.CreateMap<AcuerdoDetalleDto, AcuerdoDetalle>();

            Mapper.CreateMap<Acuerdo, AcuerdoDto>();
            Mapper.CreateMap<AcuerdoDto, Acuerdo>();
        }
    }
}
